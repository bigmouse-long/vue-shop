<template>
   <div>
       <el-button type="info" @click="logout">退出</el-button>
   </div>
</template>
<script>
export default {
    //退出功能实现
    methods:{
        logout:function(){
            //清空sessionStorage的token值
            window.sessionStorage.clear();
            //强制跳转到登录页面 响应式导航
            this.$router.push('/login')
        }
    }
}
</script>
<style lang="less" scoped>

</style>