/**
 * Encapsulation for sqlite module
 * 
 * @author HissYu(Yu Haixin)
 */

import sqlite from 'react-native-sqlite-storage'

sqlite.enablePromise(true);
sqlite.DEBUG(true); // NOTE: Delete this before release

type ActionName=String
type ErrorMessage=Object
type SuccessCallback=(action:ActionName)=>{}
type FailedCallback=(action:ActionName,error:ErrorMessage)=>{}
type DatabaseConfig={
    name:String,
    success:SuccessCallback,
    failed:FailedCallback
}
type TableConfig={
    name:String,
    fields:{}
}
// type SqliteClass={
//     db:SqliteDatabase,

// }

export default class Sqlite {
    constructor(database_config:DatabaseConfig) {
        this.db;
        this.dbConfig = database_config;
        this._tableName = "";
        this._tableField = "";
        this._tableWhere = "";
        this.afterQuery();

        
        if (this.dbConfig) {
            this.whenSuccess = this.dbConfig.success ? this.dbConfig.success : (action) => {
                console.log(action + " success");
            };
            delete this.dbConfig.success;

            this.whenFailed = this.dbConfig.failed ? this.dbConfig.failed : (action, err) => {
                console.log(action + " failed");
                console.log('ERR: ',err);
            };
            delete this.dbConfig.failed;
            
            this.open();
        }
    }

    /**
     * Clear query conditions
     */
    afterQuery(){
        this._tableName = "";
        this._tableField = ["*"];
        this._tableWhere = [""];
    }

    /**
     * Open database
     */
    async open() {
        this.db = await sqlite.openDatabase(this.dbConfig).catch(err=>{this.whenFailed('open',err)});
    }

    /**
     * Close database
     */
    async close() {
        await this.db;
        try {
            this.db.close().then(()=>{
                this.db = null;
                this.whenSuccess("close");
            });
        } catch (err) {
            this.whenFailed("close",err);
        }
    }

    /**
     * indicate table's name
     * @param {String} table_name 
     */
    in(table_name) {
        this._tableName = table_name;
        return this;
    }
    /**
     * indicate shown fields
     * @param {[String]} fields 
     */
    field(fields) {
        this._tableField = typeof fields === 'string' ? [fields] : fields;
        return this;
    }
    /**
     * filtrate data to shown
     * @param {[String]} condition 
     */
    where(condition) {
        this._tableWhere = typeof condition === 'string' ? [condition] : condition;
        return this;
    }

    // tableExists(table_name){
    //     let sql = '.tables'
    //     this.db.executeSql(sql).then(rec=>{
    //         console.log(rec);
    //     }).catch(err=>this.whenFailed('show',err))
    // }

    /**
     * Create new table
     * @param {TableConfig} table_config Configuration of table to create
     */
    async createTable(table_config:TableConfig) {
        let fields = table_config.fields;
        
        let f=[];
        for(let k in fields){
            f.push(`${k} ${fields[k]}`);
        }

        let sql = `CREATE TABLE IF NOT EXISTS ${table_config.name}(${f.join(',')});`;
        
        await this.db;
        try{
            this.db.executeSql(sql).then(()=>{
                this.whenSuccess("creation");
            })
        }catch(err){
            this.whenFailed("creation",err);
        }
    }

    /**
     * drop specific table
     * @param {String} table_name name of table to drop
     */
    async dropTable(table_name) {
        let sql = `DROP TABLE ${table_name}`;
        
        await this.db;
        try {
            this.db.executeSql(sql).then(()=>{
                this.whenSuccess("drop");
            });
        } catch (err) {
            this.whenFailed("drop",err);            
        }
    }
    /**
     *  insert given data and return its ID or false (when failed)
     * @param {Object} inserted_data single line of data
     * @returns {Promise<false> | Promise<Number>} failed | inserted item's id
     */
    async insert(inserted_data) {
        let fields = [];
        let values = [];
        // console.log(inserted_data);
        for(let k in inserted_data){
            fields.push(k);
            values.push(inserted_data[k]);
        }
        let sql = `INSERT INTO ${this._tableName} (${fields.join(',')}) VALUES (${fields.map(v=>v&&'?').join(',')});`;
        this.afterQuery();

        await this.db;
        try {
            let res = await this.db.executeSql(sql,values).then(res=>{
                this.whenSuccess("insert");
                return res[0].insertId;
            }).catch(err=>{
                this.whenFailed('insert',err);
                return false;
            });

            return res;
        } catch (err) {
            this.whenFailed("insert",err);
            return false;
        }
    }

    /**
     * select data
     * @returns {Promise<false> | Promise<DataArray>}
     */
    async select() {        
        if(!this._tableWhere.toString()) this._tableWhere=['1'];
        let sql=`SELECT ${this._tableField.join(',')} FROM ${this._tableName} WHERE ${this._tableWhere.join(' AND ')};`;
        this.afterQuery();
        
        // let ret;
        await this.db;
        try {
            let result = await this.db.executeSql(sql).then(res=>{
                this.whenSuccess("select");
                // console.log('res:',);
                return res[0].rows.raw();
            }).catch(err=>{
                this.whenFailed("select",err);
                return false;
            })

            return result;
        } catch (err) {
            this.whenFailed("select",err);
            return false;
        }
    }

    /**
     *  update given data and return its ID or false (when failed)
     * @param {Object} updated_data single line of data
     * @returns {Promise<false> | Promise<Number>} failed | affected rows' count
     */
    async update(updated_data) {
        if(!this._tableWhere.toString()) {
            this.whenFailed("update","condition cannot be null");
            return false;
        }
        let fields=[]; let values=[];
        for(let k in updated_data){
            fields.push(k);
            values.push(updated_data[k]);
        }
        let sql=`UPDATE ${this._tableName} SET ${fields.map((val)=>(val+'='+'?')).join(',')} WHERE ${this._tableWhere.join(' AND ')};`;
        this.afterQuery();
        
        await this.db;
        try {
            let result = await this.db.executeSql(sql).then(res=>{
                this.whenSuccess("update");
            
                return res[0].rowsAffected;
            }).catch(err=>{
                this.whenFailed("update",err);
                return false;
            })

            return result;
        } catch (err) {
            this.whenFailed("update",err);
            return false;
        }
    }

    /**
     * delete certain line
     * @returns {Promise<false> | Promise<Number>} failed | affected rows' count
     */
    async delete() {
        if(!this._tableWhere.toString()) {
            this.whenFailed("delete","condition cannot be null");
            return false;
        }
        let sql=`DELETE FROM ${this._tableName} WHERE ${this._tableWhere.join(' AND ')};`;
        this.afterQuery();
        await this.db;
        try {
            let result = await this.db.executeSql(sql).then(res=>{
                this.whenSuccess("delete");
            
                return res[0].rowsAffected;
            }).catch(err=>{
                this.whenFailed("delete",err);
                return false;
            })

            return result;
        } catch (err) {
            this.whenFailed("delete",err);
            return false;
        }
    }
}