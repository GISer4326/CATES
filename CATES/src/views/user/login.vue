<template>
<div class="login-div">
  <div class="login-box">
    <div class="login-title">
      <h1>欢迎访问</h1>
    </div>
    <div class="login-form">
      <Form ref="formLogin" :model="formLogin" :rules="formLoginRules" :label-width="70" label-position="left">
        <FormItem prop="username" label="用户名">
          <Input  v-model="formLogin.username" placeholder="输入用户名">
            <Icon type="ios-person-outline" slot="prepend"></Icon>
          </Input>
        </FormItem>
        <FormItem prop="password" label="密码">
          <Input type="password" v-model="formLogin.password" placeholder="输入密码">
            <Icon type="ios-lock-outline" slot="prepend"></Icon>
          </Input>
        </FormItem>
        <div class="login-button">
          <Button type="primary" ghost @click="handleSubmitLogin('formLogin')">登录</Button>
        </div>
        <div class="register">
          <router-link to="/signup">注册</router-link>
          <router-link to="">忘记密码</router-link>
        </div>
      </Form>
    </div>
  </div>
</div>
</template>

<script>
import {request} from "@/network/request";
export default {
  name:"Login",
  data() {
    return {
      formLogin:{
        username:"",
        password:"",
      },
      formLoginRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
        ]
      }
    }
  },
  methods: {
    handleSubmitLogin(name) {
      sessionStorage.setItem('username', this.formLogin.username);
      this.$refs[name].validate((valid) => {
        this.$Spin.show();
        let params = new URLSearchParams();
        // 参数的名称不能是username ！！！！！！！！！！！
        params.append("username1", this.formLogin.username);
        params.append("password1", this.formLogin.password);

        // let params = new URLSearchParams();
        // params.append("newProjectName", "1014");
        // params.append("userName", "xjs1");
        // request
        //   .post('/project/create', params)
        //   .then(res => {
        //     if (res.data.errCode == 200) {
        //       this.$Message.success({
        //         content: '项目创建成功！',
        //         duration: 3
        //       });
        //       this.createProjectStatus = 'modelRunSuccessed';
        //       // this.$store.commit("SET_PROJECT_NAME", this.formProjectItem.projectName);
        //     } else {
        //       this.$Message.error({
        //         content: '项目已存在，请重新创建！',
        //         duration: 3,
        //       });
        //       this.formProjectItem.projectName = '';
        //       this.createProjectStatus = 'modelSetting';
        //       this.isProjectNameVaild = false;
        //     }
        //   })
        //   .catch(e => {
        //     console.log(e)
        //     this.$Message.error('项目创建失败，请重新创建！');
        //     this.createProjectStatus = 'modelSetting';
        //   });

        // request.post('/project/login1',params)
        //     .then(res=>{
        //       if (res.data.errCode === 200) {
        //         this.$Message.success({
        //           content: '登录成功',
        //           duration: 10
        //         })
        //       }else {
        //         this.$Notice.error({
        //           title: '登录失败',
        //           desc: '失败原因： ' + res.data.errMsg,
        //           duration:10
        //         });
        //         sessionStorage.removeItem('username');
        //       }
        //     }).catch(e => {
        //       console.log(e)
        //         this.$Notice.error({
        //           title: '登录失败',
        //         });
        //     })


        if (valid) {
          // var paramObj = {
          //   username: this.formLogin.username,
          //   password: this.formLogin.password
          // };

          
          // var options = {
          //   headers: {
          //     "content-type": "application/json"
          //   },
          //   method: "POST",
          //   data: JSON.stringify(paramObj)
          // };
          // request('/user/login',options)
          request.post('/user/login1',params)
            .then(res=>{
              if (res.data.errCode === 200) {
                this.$Message.success({
                  content: '登录成功',
                  duration: 10
                })
                // console.log(res);
                if (localStorage.getItem('mytoken') !== res.headers.authorization) {
                  localStorage.setItem('mytoken', res.headers.authorization)
                }
                this.$router.push({name:'Home'})
                this.$store.commit("SET_USERNAME_STATUS", this.formLogin.username);
                sessionStorage.setItem('username', this.formLogin.username);
                // this.$router.replace({name:'Home'})
                // this.$router.go(-1)
                
              }else {
                this.$Notice.error({
                  title: '登录失败',
                  desc: '失败原因： ' + res.data.errMsg,
                  duration:10
                });
                sessionStorage.removeItem('username');
              }
            }).catch(e => {
              console.log(e)
                this.$Notice.error({
                  title: '登录失败',
                });
            })
        } else {
            this.$Message.error('用户名或密码校验未通过！');
        }
      })
    }
  },
}
</script>

<style>
  @import '../../assets/css/login.css';
</style>
