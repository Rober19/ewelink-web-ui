import { Component, OnInit } from "@angular/core";
// import { HttpClient } from "@angular/common/http";
import { SwitchService, stateDevice } from "../services/switch.service";
import {
  openWebSocketMixin,
  ChangeState
} from "../services/socket.service";
import { isString } from "util";
import { Data } from "@angular/router";

@Component({
  selector: "app-switch",
  templateUrl: "./switch.component.html",
  styleUrls: ["./switch.component.scss"]
})
export class SwitchComponent implements OnInit {
  public value1: boolean = false;
  public loadDevices = true;
  public devices: any[] = [];
  public wsp: any = "";
  public authData: Data | any;

  constructor(public switchService: SwitchService) {
    this.authData = JSON.parse(localStorage.getItem('data'));
  }

  ngOnInit() {
  }

  async ngAfterViewInit() {
    this.getAllDevices();

    this.wsp = await openWebSocketMixin.openWebSocket(
      (res: any) => {
        console.log(res);
        if (!isString(res)) {
          if (res.params) {
            // this validtion for "Pong" case
            this.devices.map(data => {
              if (data.deviceid == res.deviceid)
                Object.assign(data, {
                  state: res.params.switch,
                  request: false
                });
              // console.log(data);
            });
          }
        }
      },
      { at: this.authData.at, apiKey: this.authData.user.apikey, region: this.authData.region }
    );
  }

  //this method is for changing the device state from button
  async changeState(item: any) {
    try {
      item.request = true;

      let newState = item.state == "off" ? "on" : "off";

      let actionParams = {
        at: this.authData.at,
        apiKey: this.authData.user.apikey,
        deviceId: item.deviceid,
        params: { switch: newState },
        // state: newState
      };

      const pay = ChangeState.set(actionParams);

      console.log(pay)
      await this.wsp.send(pay);

      // await this.wsp.send(JSON.stringify({
      //   action: 'update',
      //   deviceid: item.deviceid,
      //   apikey: '6613294f-2a51-4c0c-9a88-9c5329959d82',
      //   userAgent: 'app',
      //   sequence: '1579309886515',
      //   ts: 0,
      //   params: { switch: newState },
      //   tempRec: '10008930f6',
      // }));

      const { data }: any = await this.switchService.getDevice(item.deviceid);
      console.log(data)
      item.state = data.state;

      item.request = false;
    } catch (error) {
      item.request = false;
    }
  }

  // this method get all devices data
  async getAllDevices() {
    const { data }: any = await this.switchService.getDevices();
    console.log(data);
    this.devices = data;
    this.loadDevices = false;
  }

  // this method change a device state by id
  async setStatus(status: boolean, deviceid: string) {
    await this.switchService.setDeviceStatus(status ? "on" : "off", deviceid);
  }

  // this method toggle state device by id
  async toggleDevie(deviceid: string) {
    await this.switchService.toggleDevice(deviceid);
  }
  //this method is get true/false from "on" or "off"
  getState(state: stateDevice) {
    return state == "on" ? true : state == "off" ? false : new Error();
  }
}