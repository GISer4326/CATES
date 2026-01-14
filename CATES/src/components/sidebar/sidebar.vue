<template>
  <div class="layout">
    <Header>
      <Menu mode="horizontal" theme="dark" active-name="1">
        <div class="layout-logo">
          
          GeoWAMES
        </div>
        <div class="layout-nav">
            <!-- <div class="user">
              <Dropdown>
                <Avatar icon="ios-person" /> 
                <a href="javascript:void(0)" style="color: #D3CEDF;">
                  <span style="margin-left: 3px;">用户中心</span>
                  <Icon type="ios-arrow-down"></Icon>
                </a>
                <DropdownMenu slot="list">
                  <DropdownItem >
                    <span @click="showProjectDrawer">工程项目管理</span>
                  </DropdownItem>
                  <DropdownItem >
                    <span @click="showEditPasswordDrawer">修改密码</span>
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
            <div class="logout" >
                <span style="cursor:pointer;" @click="confirmLogout">退出登录</span> 
            </div> -->
        </div>
      </Menu>
    </Header>
    <Layout>
      <Layout> 
        <Content :style="{background: '#fff', Height: '260px'}">
        <!-- <Content :style="{margin: '10px', background: '#fff', Height: '260px'}"> -->
          <MapView></MapView>
          <!-- <basin-show :basinShow.sync="basinShow"></basin-show>
          <create-model :createModelShow.sync="createModelShow"></create-model>
          <run-model :runModelShow.sync="runModelShow"></run-model>
          <calibration-model :caliModelShow.sync="caliModelShow"></calibration-model> -->
          <GeoDataShowControl></GeoDataShowControl>  
          <!-- 修改密码页面 -->
          <Drawer title="修改密码" v-model="isShowEditPassword" width="400" :mask-closable="false" :styles="editPasswordStyle"
                  :inner="true" :transfer="false" style="z-index:9998">
            <div>
              <Form ref="formEditPassword" :model="formEditPassword" :rules="formEditPasswordRules" :label-width="100">
                <FormItem prop="password" label="输入旧密码">
                  <Input type="password" v-model="formEditPassword.oldPassword" placeholder="输入旧密码">
                    <Icon type="ios-lock-outline" slot="prepend"></Icon>
                  </Input>
                </FormItem>
                <FormItem prop="confirmPwd" label="输入新密码">
                  <Input type="password" v-model="formEditPassword.newPassword" placeholder="请输入新密码">
                    <Icon type="ios-lock-outline" slot="prepend"></Icon>
                  </Input>
                </FormItem>
                <FormItem prop="confirmPwd" label="确认新密码">
                  <Input type="password" v-model="formEditPassword.confirmNewPwd" placeholder="请输入新密码">
                    <Icon type="ios-lock-outline" slot="prepend"></Icon>
                  </Input>
                </FormItem>
                <div class="edit-password-button">
                  <Button type="success" ghost @click="handleSubmitEitdPwd('formEditPassword')">确定</Button>
                  <Button type="error" ghost @click="cancelEitdPwd">取消</Button>
                </div>
              </Form>
            </div>
          </Drawer>
          <Drawer title="工程项目管理" v-model="isShowProjectManagement" width="400" :mask-closable="false" :styles="editPasswordStyle"
                  :inner="true" :transfer="false" style="z-index:9998">
            <div>
              <!--<h2>根据创建时间查询项目</h2>
              <DatePicker type="datetimerange" format="yyyy-MM-dd HH:mm" v-model="queryProjectDateRange" size="small" 
                      placeholder="请时间段查询项目" style="width: 275px" transfer split-panels :clearable="false" @on-change="timeChange(queryProjectDateRange)"/>
              <Button type="success" ghost @click="queryProjectByTime" :disabled="queryProjectDateRange==null" size="small">查询</Button>-->
              <table>
                <thead>
                  <tr>
                    <th>创建时间</th>
                    <th>项目名称</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in tableData" :key="index">
                    <td>{{ item.createTime }}</td>
                    <td>{{ item.projectname }}</td>
                    <td>
                      <button @click="downloadItem(index)" class="button-cell">下载</button>
                      <button @click="deleteItem(index)">删除</button>
                    </td>
                  </tr>
                </tbody>
              </table>
              <!--<Table id='projectShow' border :columns="projectTableColumns" :data="projectTableData" :loading="projectTableLoading">
          
              </Table>-->
            </div>
          </Drawer>
        </Content>
      </Layout>
    </Layout>
    <Modal v-model="isShowLogout" :mask-closable="false" width="320">
      <p slot="header" class="logout-model-header">
          <Icon type="ios-information-circle"></Icon>
          <span>退出登录提示</span>
      </p>
      <div class="logout-model-text">
        <span >是否退出登录？</span>
      </div>
      <div slot="footer" class="logout-model-btn">
        <Button type="primary" ghost @click="cancelLogout">取消</Button>
        <Button type="error" ghost @click="logout">退出</Button>
      </div>
    </Modal>
  </div>
</template>

<script>

import MapView from '../MapView'
import GeoDataShowControl from '../control/GeoDataShowControl.vue'
import loginVue from '../../views/user/login'
import {request} from "@/network/request";
import axios from 'axios';
    export default {
      name:'SideBar',
      // components:{MapView,GeoDataShowControl, BasinShow, CreateModel, RunModel,CalibrationModel},
      components:{MapView,GeoDataShowControl},
      data(){
        const validatePassword = (rule, value, callback) =>{
          if (value) {
            if (value.length<6){
              callback(new Error('密码长度应多于6位'))
            } else if(value.length>16){
              callback(new Error('密码长度应少于20位'))
            } else if (!value.match(/^(?![\d]+$)(?![a-zA-Z]+$)(?![^\da-zA-Z]+$)([^\u4e00-\u9fa5\s]){6,20}$/)) {
              callback(new Error('字母、数字和标点符号（除空格）至少包含两种'))
            } else{
                callback()
            }
          }
        };
        const validateConfirmPassword = (rule, value, callback) =>{
          if (value) {
            if (value !== this.formSignup.newPassword){
              callback(new Error('两次输入新密码不一致'))
            } else{
                callback()
            }
          }
        };
        return {
          tableData:[],
          active: "/basinshow",
          basinShow:false,
          createModelShow:false,
          runModelShow:false,
          caliModelShow:false,
          username:'',
          isShowLogout:false,
          isShowEditPassword:false,
          formEditPassword:{
            oldPassword:'',
            newPassword:'',
            confirmNewPwd:'',
          },
          formEditPasswordRules:{
            newPassword: [
              { required: true, message: '输入新密码', trigger: 'blur' },
              { type: 'string', validator: validatePassword, trigger: 'blur', }
            ],
            confirmNewPwd: [
              { required: true, message: '再次输入新密码', trigger: 'blur' },
              { type: 'string', validator: validateConfirmPassword, trigger: 'blur', }
            ]
          },
          editPasswordStyle: {
            height: 'calc(100% - 200px)',
            overflow: 'auto',
            paddingBottom: '53px',
            position: 'static'
          },
          isShowProjectManagement:false,
          projectTableColumns:[
            {
                title: '创建时间',
                key: 'createTime',
                sortable: true
            },
            {
                title: '项目名称',
                key: 'projectname'
            },
            {
                title: '操作',
                key: 'option'
            }
          ],
          projectTableData:[
            {
              createTime: '',
              projectName: ''
            },
          ],
          queryProjectDateRange:null,
          queryProjectStartTime:'',
          queryProjectEndTime:'',
          projectTableLoading:false,

        }
      },
      mounted(){
          this.username=this.$store.getters.username;
      },
      updated(){


      },
      methods: {
        downloadItem(index) {
          const username=this.tableData[index].username;
          const projectname=this.tableData[index].projectname;
          const xhr = new XMLHttpRequest();
          xhr.open("GET", "http://localhost:8888/api/project/downloadProjectZip?username="+username+"&projectname="+projectname, true);
          xhr.responseType = "blob"; // Set the response type to blob

          xhr.onload = () => {
            if (xhr.status === 200) {
              const blob = xhr.response;
              const url = window.URL.createObjectURL(blob);

              // Create a link element to trigger the download
              const link = document.createElement("a");
              link.href = url;
              link.download = "downloaded.zip";
              document.body.appendChild(link);
              link.click();

              // Clean up resources
              window.URL.revokeObjectURL(url);
              document.body.removeChild(link);
            }
          };
          xhr.send();
          
        },
        deleteItem(index) {
          // Logic to handle deleting for the specific item at index
          // You can use this.tableData[index] to access the data
          //this.tableData.splice(index, 1); // Remove the item from the data array
          let params = new URLSearchParams();
          params.append("username",this.tableData[index].username);
          params.append("projectname",this.tableData[index].projectname);
          request
          .post('/project/deleteProjectByUserName',params)
          .then(res=>{
            if (res.data.errCode === 200) {
              this.$Notice.success({
                title: '删除成功',
                duration: 10
              })
              //const jsonResponse ='[{"createTime":"Data 1","projectname":"Data 2"},{"createTime":"Data 3","projectname":"Data 4"}]';
              const jsonResponse=res.data.data;
              //this.tableData = JSON.parse(jsonResponse);
              this.tableData = jsonResponse;
              this.projectTableData = res.data.data;
            } else {
              this.$Notice.error({
                title: '删除失败',
                duration:10
              });
            }
          }).catch(e => {
              this.$Notice.error({
                title: '删除失败',
                // desc: '失败原因： ' + res.data.errMsg,
              });
          }),
          this.isShowProjectManagement = false;
        },
        confirmLogout(){
          this.isShowLogout=true;
        },
        cancelLogout(){
          this.isShowLogout=false;
        },
        logout(){
          var options = {
            headers: {
              "content-type": "application/json"
            },
            method: "POST",
          };
          request('/user/logout',options)
            .then(res=>{
              if (res.data.errCode === 200) {
                this.$Message.success({
                  content: '退出登录！',
                  duration: 10
                })
                localStorage.setItem('mytoken', '')
                this.$router.push({name:'Login'})
                this.$store.commit("SET_USERNAME_STATUS", '');
                // this.$router.replace({name:'Home'})
                // this.$router.go(-1)
              }else {
                this.$Message.error({
                  content: '登录信息已过期',
                  duration:10
                });
                this.$router.push({name:'Login'})
              }
            }).catch(e => {
                this.$Message.error({
                  title: '登录信息已过期',
                });
                this.$router.push({name:'Login'})
            })
        },
        showEditPasswordDrawer(){
          this.isShowEditPassword=true;
        },
        handleSubmitEitdPwd(name) {
          this.$refs[name].validate((valid) => {
            if (valid) {
              var paramObj = {
                  username: this.username,
                  password: this.formEditPassword.oldPassword,
                  newPassword: this.formEditPassword.newPassword
                };
              var options = {
                headers: {
                  "content-type": "application/json"
                },
                method: "POST",
                data: JSON.stringify(paramObj)
              };
              request('/user/editPassword',options)
              .then(res=>{
                if (res.data.errCode === 200) {
                  this.$Message.success({
                    content: '密码修改成功',
                    duration: 10
                  })
                  this.$router.push({name:'Login'})
                } else if (res.data.errCode === 401){
                  this.$Notice.error({
                    title: '密码修改失败',
                    desc: "用户登录信息失效",
                    duration:10
                  });
                  this.$router.push({name:'Login'})
                } else {
                  this.$Notice.error({
                    title: '密码修改失败',
                    desc: '失败原因： ' + res.data.errMsg,
                    duration:10
                  });
                  this.formEditPassword.oldPassword = ''
                  this.formEditPassword.newPassword = ''
                  this.formEditPassword.confirmNewPwd = ''
                }
              }).catch(e => {
                  this.$Notice.error({
                    title: '密码修改失败',
                    desc: '失败原因： ' + res.data.errMsg,
                  });
              })
            } else {
              this.$Message.error('密码校验未通过!');
            }
          })
        },
        cancelEitdPwd(){
          this.isShowEditPassword = false;
        },
        dateFormat(fmt, date) {
          let ret;
          const opt = {
              "Y+": date.getFullYear().toString(),        // 年
              "m+": (date.getMonth() + 1).toString(),     // 月
              "d+": date.getDate().toString(),            // 日
              "H+": date.getHours().toString(),           // 时
              "M+": date.getMinutes().toString(),         // 分
              "S+": date.getSeconds().toString()          // 秒
              // 有其他格式化字符需求可以继续添加，必须转化成字符串
          };
          for (let k in opt) {
              ret = new RegExp("(" + k + ")").exec(fmt);
              if (ret) {
                  fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")))
              };
          };
          return fmt;
        },
        timeChange(dataRange){
          var beginDate = new Date(dataRange[0]);
          var endDate = new Date(dataRange[1]);
          this.queryProjectStartTime = this.dateFormat("YYYY-mm-dd HH:MM:SS", beginDate)
          this.queryProjectEndTime = this.dateFormat("YYYY-mm-dd HH:MM:SS", endDate)
        },
        showProjectDrawer(){
          this.isShowProjectManagement = true;
          {
          this.projectTableLoading = true;
          const username = sessionStorage.getItem('username');
          let params = new URLSearchParams();
          params.append("username",username);
          request
          .post('/project/queryProjectByUserName',params)
          .then(res=>{
            if (res.data.errCode === 200) {
              this.$Notice.success({
                title: '项目查询成功',
                duration: 10
              })
              //const jsonResponse ='[{"createTime":"Data 1","projectname":"Data 2"},{"createTime":"Data 3","projectname":"Data 4"}]';
              const jsonResponse=res.data.data;
              //this.tableData = JSON.parse(jsonResponse);
              this.tableData = jsonResponse;
              //this.projectTableData = res.data.data;
            } else {
              this.$Notice.error({
                title: '项目查询失败',
                duration:10
              });
            }
          }).catch(e => {
              this.$Notice.error({
                title: '项目查询失败',
                // desc: '失败原因： ' + res.data.errMsg,
              });
          })
          //this.projectTableLoading = false;
        }
        },
        queryProjectByTime(){
          this.projectTableLoading = true;
          var paramObj = {
            queryStartTime:this.queryProjectStartTime,
            queryEndTime:this.queryProjectEndTime
          };
          var options = {
            headers: {
              "content-type": "application/json"
            },
            method: "POST",
            data: JSON.stringify(paramObj)
          };
          request('/project/queryProjectByTime',options)
          .then(res=>{
            if (res.data.errCode === 200) {
              this.$Notice.success({
                title: '项目查询成功',
                duration: 10
              })
              this.projectTableData = res.data.data;
            } else {
              this.$Notice.error({
                title: '项目查询失败',
                duration:10
              });
            }
          }).catch(e => {
              this.$Notice.error({
                title: '项目查询失败',
                // desc: '失败原因： ' + res.data.errMsg,
              });
          })
          this.projectTableLoading = false;
        },
      },
    }
</script>

<style scoped>
    .layout{
      border: 1px solid #d7dde4;
      background: #f5f7f9;
      position: relative;
      border-radius: 4px;
      overflow: hidden;
    }
    .layout-logo{
      width: 100px;
      height: 30px;
      /* background: #dedfaa; */
      border-radius: 3px;
      float: left;
      position: relative;
      top: 15px;
      left: 20px;
      line-height: 1;
      font-size: 40px;
      color: white;
    }
    .layout-nav{
      width: 270px;
      margin: 0 auto;
      margin-right: 20px;
      display: flex;
    }
    .layout-nav>div{
      margin-left: 40px;
      font-size: 16px;
    }
    .layout-header-bar{
      background: #fff;
      box-shadow: 0 1px 1px rgba(0,0,0,.1);
    }
    .layout-logo-left{
      width: 90%;
      height: 30px;
      background: #70655b;
      border-radius: 3px;
      margin: 15px auto;
    }
    .menu-icon{
      transition: all .3s;
    }
    .rotate-icon{
      transform: rotate(-90deg);
    }
    .menu-item span{
      display: inline-block;
      overflow: hidden;
      width: 75px;
      text-overflow: ellipsis;
      white-space: nowrap;
      vertical-align: bottom;
      transition: width .2s ease .2s;
    }
    .menu-item i{
      transform: translateX(0px);
      transition: font-size .2s ease, transform .2s ease;
      vertical-align: middle;
      font-size: 16px;
    }
    .collapsed-menu span{
      width: 0px;
      transition: width .2s ease;
    }
    .collapsed-menu i{
      transform: translateX(5px);
      transition: font-size .2s ease .2s, transform .2s ease .2s;
      vertical-align: middle;
      font-size: 22px;
    }
    .user>a {
      color: #D3CEDF;
      
    }
    .logout {
      color: #DAB88B;
    }
    .ivu-layout-header {
      background-color: #748DA6;
    }
    .ivu-menu-dark {
      background-color: #748DA6;
    }
    .logout-model-header{
      color:#f60;
      text-align:center;
      font-size: 16px;
    }
    .logout-model-text{
      font-size: 20px;
      text-align:center
    }
    .logout-model-btn{
      display: flex;
      justify-content: center ;
      margin: 0 20px;
    }
    .logout-model-btn>button{
      width: 40%;
    }
    .edit-password-button{
      display: flex;
      justify-content: center ;
      margin-top: 7px;
      text-align: center;
    }
    .edit-password-button>button{
      width: 30%;
      margin:0 10px;
    }
    th {
      padding: 8px; /* 设置单元格内边距 */
      text-align: center; /* 居中文本 */
      background-color: #f2f2f2; /* 设置背景色 */
      border-bottom: 5px solid #ccc; /* 设置底部边框 */
    }
    td {
      text-align: center; /* 居中文本 */
      padding: 10px; /* 设置单元格内边距 */
      border: 1px solid #ccc; /* 设置边框 */
    }
    button{
      padding:0 5px 0 5px;
    }
    .button-cell {
      margin: 0 10px; /* 设置按钮之间的水平间距 */
    }
</style>