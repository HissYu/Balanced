import React, { Component } from 'react';
import { ToastAndroid, Text, View, Picker, TextInput, Dimensions, TouchableOpacity, StatusBar } from 'react-native';
import { Header, Overlay, Icon } from 'react-native-elements';
import DatePicker from 'react-native-datepicker';
import styles from './styles';
import { DatabaseConfig, TableBasicAccounting, BaseTableFieldTitle } from '../../config/DatabaseConfig';
import Sqlite from '../../lib/sqlite';
import moment from 'moment';
import ThemeConfig from '../../config/ThemeConfig'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

type Props = {
    db: Sqlite,
    data: {},
    refresh: () => {},
};
let db;
class Modify extends Component<Props>{
    constructor(props) {
        super(props);
        this.state = {
            isVisible: false,
            cyclely: this.props.data.cycleCount != null,
            Amount: this.props.data.amount,
            Method: this.props.data.method,
            Usage: this.props.data.usage,
            Note: this.props.data.note,
            cycle: this.props.data.cycleCount,
            cycleUnit: this.props.data.cycleUnit,
            date: moment(this.props.data.firstTime).format("YYYY-MM-DD"),
        };
        db = this.props.db;
    }
    async componentWillMount() {
        await db.createTable(TableBasicAccounting);
    }
    setModalVisible(visible) {
        this.setState({ isVisible: visible });
    }
    inputPart() {
        return (
            <View>
                <View style={styles.header}>
                    <Icon
                        name='keyboard-arrow-left'
                        type='material'
                        color={ThemeConfig.themeMainColor}
                        size={19}
                        reverse
                        onPress={() => this.setState({ isVisible: false })}
                    />
                    <Text style={{ color: '#fff' }}>Modify</Text>
                    <View style={{ marginLeft:'63%'}}>
                        <Icon
                            name='delete-forever'
                            type='material'
                            color={ThemeConfig.themeMainColor}
                            size={19}
                            reverse
                            onPress={() => this.deleteData({ isVisible: false })}
                        />
                    </View>
                </View>
                <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 100, paddingBottom: 50 }}>
                    <KeyboardAwareScrollView>
                        <View style={{ flexDirection: 'row', alignItems: 'stretch' }}>
                            <Text style={styles.text}>Amount:</Text>
                            <Text style={styles.money}>￥</Text>
                            {this.myTextInput('Amount', 'numeric')}
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={styles.text}>Method:</Text>
                            {this.myPicker('Method', BaseTableFieldTitle.method)}
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={styles.text}>Usage:</Text>
                            {this.myPicker('Usage', BaseTableFieldTitle.usage)}
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={styles.text}>date:</Text>
                            <DatePicker
                                style={{ width: 200, marginTop: 15 }}
                                date={this.state.date}
                                mode="date"
                                placeholder={this.state.date}
                                format="YYYY-MM-DD"
                                minDate={(moment(this.state.date).add(-2, 'Years').format("YYYY")) + "-01-01"}
                                maxDate={(moment(this.state.date).add(2, 'Years').format("YYYY")) + "-12-31"}
                                androidMode="spinner"
                                customStyles={{
                                    dateIcon: {
                                        position: 'absolute',
                                        left: 0,
                                        top: 4,
                                        marginLeft: 0
                                    },
                                    dateInput: {
                                        marginLeft: 36
                                    }
                                }}
                                onDateChange={(date) => { this.setState({ date: date }); }}
                            />
                        </View>
                        {this.state.cyclely ? this.cyclelyPart() : () => { return; }}
                        <View style={{ flexDirection: 'row', alignItems: 'stretch' }}>
                            <Text style={styles.text}>Note:</Text>
                            {this.myTextInput('Note', 'default')}
                        </View>
                        <View style={{ alignItems: 'center', justifyContent: 'center', height: 70, }}>
                            {this.myButtonModal('Confirm', () => this.updateData())}
                        </View>
                    </KeyboardAwareScrollView>
                </View>
            </View>
        );
    }
    cyclelyPart() {
        return (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={styles.text}>cycle:</Text>
                {this.myTextInput('cycle', 'numeric')}
                {this.myPicker('cycleUnit', BaseTableFieldTitle.cycleUnit)}
            </View>
        );
    }
    render() {
        return (
            <View style={styles.container}>
                <Icon
                    name='edit'
                    type='font-awesome'
                    color={ThemeConfig.themeMainColor}
                    reverse
                    onPress={() => this.setState({ isVisible: true })}
                />
                <Overlay
                    overlayStyle={{ padding: 0 }}
                    isVisible={this.state.isVisible}
                    overlayBackgroundColor='white'
                    fullScreen={true}
                    onBackdropPress={() => this.setState({ isVisible: false })}
                >
                    {this.inputPart()}
                </Overlay>
            </View>
        );
    }
    myTextInput = (item, boardType) => {
        return (
            <TextInput
                style={[styles.input, styles['input' + item]]}
                onChangeText={(value) => this.setState({ [item]: value })}
                keyboardType={boardType}
            >{this.state[item]}</TextInput>
        );
    }
    myButtonModal = (text, func) => {
        return (
            <View style={styles.viewModal}>
                <TouchableOpacity
                    style={[styles.myButtonModal, styles['button' + text]]}
                    onPress={func}
                >
                    <Text style={[styles.textModal, styles['text' + text]]}>{text}</Text>
                </TouchableOpacity>
            </View>
        )
    }
    myPicker = (item, data) => {//To creat a picker,item is a state, data is a array
        let pickerItem = data.map((label, index) => {
            return (<Picker.Item label={label} value={index} key={toString(index)} />)
        });
        return (
            <Picker
                style={[styles.picker, styles[item + 'Picker']]}
                selectedValue={this.state[item]}
                onValueChange={(value) => this.setState({ [item]: value })}>
                {pickerItem}
            </Picker>
        )
    }
    clearData() {
        this.setState({
            Amount: '',
            Method: 0,
            Usage: 0,
            Note: '',
            cycle: null,
            cycleUnit: 0,
            date: (moment().format("YYYY-MM-DD")),
        });
    }
    async deleteData() {
        await db.in(TableBasicAccounting.name).where(`id==${this.props.data.id}`).delete();
        this.props.refresh();
        ToastAndroid.showWithGravity('Submit success!', ToastAndroid.SHORT, ToastAndroid.CENTER);
        this.setState({ isVisible: false });
    }
    async updateData() {
        let str = '';
        if (this.state.Amount == '')
            str = 'Please enter Amount';
        else if (this.state.Amount == '0')
            str = 'Amount can\'t be zero';
        else if (isNaN(this.state.Amount))
            str = 'Amount should be a number';
        else if (this.state.cyclely == true) {
            if (this.state.cycle == '' || this.state.cycle == null)
                str = 'Please enter cycle';
            else if (this.state.cycle == '0')
                str = 'Cycle can\'t be zero';
            else if (isNaN(this.state.cycle))
                str = 'cycle should be a number';
        }
        if (str != '') {
            ToastAndroid.showWithGravity(str, ToastAndroid.LONG, ToastAndroid.CENTER);
            return;
        }
        await db.in(TableBasicAccounting.name).where(`id==${this.props.data.id}`).update({
            amount: this.state.Amount,
            method: this.state.Method,
            note: this.state.Note,
            usage: this.state.Usage,
            cycleCount: (this.state.cyclely ? this.state.cycle : null),
            cycleUnit: this.state.cycleUnit,
            firstTime: this.state.date,
            nextTriggerTime: this.state.date,
        });
        this.clearData();
        this.props.refresh();
        ToastAndroid.showWithGravity('Submit success!', ToastAndroid.SHORT, ToastAndroid.CENTER);
        this.setState({ isVisible: false });
    }
}
export default Modify;