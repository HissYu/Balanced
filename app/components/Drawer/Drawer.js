import React, { Component } from 'react';
import { View, DrawerLayoutAndroid, StyleSheet, Text, TouchableOpacity, BackHandler } from 'react-native';
import { Icon } from 'react-native-elements'

import Main from '../MainPage/Main';
import UpDownModal from './Up-Download';
import Sqlite from '../../lib/sqlite';

type Props = {
  db: Sqlite
}
export default class Drawer extends Component<Props>{
  constructor(props) {
    super(props);
    this.state = { TotalDeposit: 0, MainPageFlag: true, showingOverlay:'none' };
    this.DrawerIn = this.DrawerIn.bind(this);
  }

  DrawerIn = () => {
    return (
      <View style={{ flex: 1, justifyContent: 'flex-start' }}>
        <View style={styles.NavigaterHead}><Text style={{ fontSize: 20, color: 'white', fontWeight: '700' }}>Total Deposit: ￥{this.state.TotalDeposit}</Text></View>
        <TouchableOpacity style={styles.NavigateItem} onPress={() => this._ChangeMainPage()}>
          <Icon name='pie-chart' type='material' size={35} color='grey' />
          <Text style={{ fontSize: 20, marginLeft: 20, fontWeight: '700' }}>{this.state.MainPageFlag == true ? ("Statistics") : ("MainPage")}</Text>
          <View style={styles.right_arrow}>
            <Icon name='chevron-right' type='material' size={35} color='grey' />
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.NavigateItem} onPress={()=>{this.setState({showingOverlay:'upload'})}}>
          <Icon name='backup' type='material' size={35} color='grey' />
          <Text style={{ fontSize: 20, marginLeft: 20, fontWeight: '700' }}>Cloud Backup</Text>
          {/* <View style={styles.right_arrow}>
            <Icon name='chevron-right' type='material' size={35} color='grey' />
          </View> */}
        </TouchableOpacity>
        <TouchableOpacity style={styles.NavigateItem} onPress={()=>{this.setState({showingOverlay:'download'})}}>
          <Icon name='cloud-download' type='material' size={35} color='grey' />
          <Text style={{ fontSize: 20, marginLeft: 20, fontWeight: '700' }}>Restore</Text>
          {/* <View style={styles.right_arrow}>
            <Icon name='chevron-right' type='material' size={35} color='grey' />
          </View> */}
        </TouchableOpacity>
      </View>
    )
  };

  openDrawer() {
    this.refs.drawerLayout.openDrawer();
  }

  closeDrawer() {
    this.refs.drawerLayout.closeDrawer()
  }

  _ChangeMainPage = () => {
    let flag = !this.state.MainPageFlag;
    this.setState({ MainPageFlag: flag });
    this.closeDrawer();
  }

  closeModal(){
    if(this.state.showingOverlay!=='none')
      this.setState({showingOverlay:'none'});
  }
  render() {
    return (
      <DrawerLayoutAndroid
        ref={'drawerLayout'}
        drawerWidth={300}
        drawerPosition={DrawerLayoutAndroid.positions.Left}
        renderNavigationView={this.DrawerIn}
      >
        <UpDownModal showing={this.state.showingOverlay} handleBack={()=>{this.closeModal()}} db={this.props.db} />
        <Main db={this.props.db} setTotalDeposit={(totalDeposit) => { this.setState({ TotalDeposit: totalDeposit }) }} openDrawerCB={()=>{this.openDrawer()}} />
      </DrawerLayoutAndroid>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  NavigaterHead: {
    backgroundColor: '#2089dc',
    height: 100,
    justifyContent: 'center',
    paddingLeft: 10,
  },
  NavigateItem: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 20,
  },
  right_arrow: {
    position: 'absolute',
    right: 15,
  },
});