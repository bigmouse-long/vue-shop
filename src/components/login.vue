<template>
   
        <div class="login_container">
            <div class="loginBox">
                <!-- 头像区域 -->
                <div class="avatar_box">
                    <img src="../assets/logo.png" alt="">
                </div>
                <!-- 再为表单绑定数据对象时，model一定要用:model -->
               <el-form class="login_form" ref='loginFormReset' :model="loginForm" :rules="loginFormRules" label-width="0px">
                    <!-- 用户名区域 -->
                        <el-form-item prop="username">
                            <el-input v-model="loginForm.username" prefix-icon="iconfont icon-user"></el-input>
                        </el-form-item>
                        <!-- 密码区域 -->
                        <el-form-item prop="password">
                            <el-input v-model="loginForm.password" prefix-icon="iconfont icon-3702mima" type="password"></el-input>
                        </el-form-item>
                        <!-- 按钮区域 -->
                        <el-form-item class="btns" >
                            <el-button type="primary" @click="login" >登录</el-button>
                            <el-button type="info" @click="resetLoginForm">重置</el-button>
                        </el-form-item>
                </el-form>
            </div>
        </div>
    
</template>
<script>

export default {
    data:function(){
        return {
            //登录表单绑定的数据对象
            loginForm:{
                username:'admin',
                password:'123456'
            },
            loginFormRules:{
                  //用户名验证规则
                 username:[
                          { required: true, message: '请输入用户名', trigger: 'blur' },
                          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
                 ],
                 //密码验证规则
                 password:[
                          { required: true, message: '请输入密码', trigger: 'blur' },
                          { min: 6, max: 16, message: '长度在 6 到 16 个字符', trigger: 'blur' }
                 ]
            }
        };
       
    },
    methods:{
        //点击按钮重置表单
        resetLoginForm:function(){
            // console.log(this);
            this.$refs.loginFormReset.resetFields();
            
        },
        login:function(){
            this.$refs.loginFormReset.validate(async valid=>{
                // console.log(valid);
                if(!valid) return;
                // 当在全局配置过axios时，再调用时直接使用this.$http进行使用
                const {data:res}=await this.$http.post('login',this.loginForm);
                // console.log(res);
                if(res.meta.status==200){
                    this.$message.success('登录成功') 
                    //1.登录成功之后的token，保存到客户端的sessionStorage中
                        //1.1项目中除了登录之外的其他api接口，必须在登录之后才能访问
                        //1.2token只应在当前网站打开期间生效，所以将token保存在sessionStorage中
                    //2.通过编程式导航跳转到后台主页，路由地址/home
                    window.sessionStorage.setItem('key',res.data.token);
                    this.$router.push('/home');
                }else{
                     this.$message.error('登陆失败') 
                   
                }
                
                
            });
        }
    }
    
}
</script>
<style lang="less" scoped>
.login_container{
    height: 100%;
    background-color: #2b4b6b;
}
.loginBox{
    width: 450px;
    height: 300px;
    background: #ffffff;
    border-radius: 3px;
    position: absolute;
    left: 50%;
    top:50%;
    transform: translate(-50%,-50%);
    .avatar_box{
        width: 130px;
        height: 130px;
        border: 1px solid #eee;
        border-radius: 50%;
        padding: 10px;
        box-shadow: 0 0 10 #dddddd;
        position: absolute;
        left:50%;
        transform: translate(-50%,-50%);
        background-color: #fff;
        img{
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background-color: #eee;
        }
    }

}
.btns{
    display: flex;
   justify-content: flex-end;
}
.login_form{
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 0 20px;
    box-sizing: border-box;
}
</style>