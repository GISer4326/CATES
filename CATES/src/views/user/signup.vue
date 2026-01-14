<template>
  <div class="login-div">
    <div class="login-box">
      <div class="login-title">
        <h1>注册账号</h1>
      </div>
      <div class="login-form">
        <Form ref="formSignup" :model="formSignup" :rules="formSignupRules" :label-width="80">
          <FormItem prop="username" label="用户名">
            <Input type="text" v-model="formSignup.username" placeholder="用户名">
              <Icon type="ios-person-outline" slot="prepend"></Icon>
            </Input>
          </FormItem>
          <FormItem prop="password" label="密码">
            <Input type="password" v-model="formSignup.password" placeholder="密码">
              <Icon type="ios-lock-outline" slot="prepend"></Icon>
            </Input>
          </FormItem>
          <FormItem prop="confirmPwd" label="确认密码">
            <Input type="password" v-model="formSignup.confirmPwd" placeholder="重新输入密码">
              <Icon type="ios-lock-outline" slot="prepend"></Icon>
            </Input>
          </FormItem>
          <div class="login-button">
            <Button type="primary" ghost @click="handleSubmitSignup('formSignup')">注册</Button>
          </div>
          <div class="register">
            <router-link to="/login">已有账号，去登录</router-link>
          </div>
        </Form>
      </div>
    </div>
  </div>

</template>

<script>
import {request} from "@/network/request";
export default {
  name:"Signup",
  data() {
    const validateUsername = (rule, value, callback) =>{
      if (value) {
        if (value.length<4){
          callback(new Error('用户名长度应多于4位'));
        } else if(value.length>16){
          callback(new Error('用户名长度应少于16位'));
        } else if(!value.match(/^[a-zA-Z0-9_-]{4,16}$/)) {
          callback(new Error('用户名只能包含数字、英文字符、下划线以及减号'));
        } else{
            callback();
        }
      }
    };
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
        if (value !== this.formSignup.password){
          callback(new Error('两次输入密码不一致，请重新输入！'))
        } else{
            callback()
        }
      }
    };
    return {
      formSignup:{
        username:"",
        password:"",
        confirmPwd:"",
      },
      formSignupRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          {type:'string', validator: validateUsername, trigger: 'blur'}
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { type: 'string', validator: validatePassword, trigger: 'blur', }
        ],
        confirmPwd: [
          { required: true, message: '请再次输入密码', trigger: 'blur' },
          { type: 'string', validator: validateConfirmPassword, trigger: 'blur', }
        ],
      }
    }
  },
   methods: {
    handleSubmitSignup(name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          var paramObj = {
              username: this.formSignup.username,
              password: this.formSignup.password
            };
          var options = {
            headers: {
              "content-type": "application/json"
            },
            method: "POST",
            data: JSON.stringify(paramObj)
          };
          request('/user/signup',options)
          .then(res=>{
            if (res.data.errCode === 200) {
              this.$Message.success({
                content: '注册成功',
                duration: 10
              })
              this.$router.push({name:'Login'})
            }else {
              this.$Notice.error({
                title: '注册失败',
                desc: '失败原因： ' + res.data.errMsg,
                duration:10
              });
            }
          }).catch(e => {
              this.$Notice.error({
                title: '注册失败',
              });
          })
        } else {
          this.$Message.error('用户名或密码校验未通过!');
        }
      })
    }
  },
}
</script>

<style>
  @import '../../assets/css/login.css';
</style>