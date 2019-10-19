<template>
  <el-container class="homeBox">
    <!-- 头部区域 -->
    <el-header>
      <div>
        <img src="../assets/heima.png" alt />
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse?'64px':'200px'">
        <!-- 折叠侧边栏 -->
        <div @click="toggleCollapse" class="toggleBtn">
          <span>|||</span>
        </div>
        <!-- unique-opened 只保持一个菜单展开 -->
        <!-- 折叠侧边栏collapse和关闭侧边栏动画collapse-transition -->
        <el-menu
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409EFF"
          unique-opened
          :collapse="isCollapse"
          :collapse-transition="false"
          router
          :default-active="activePath"
        >
          <!-- 一级表单 -->
          <!-- 一定要记得属性的绑定 -->
          <el-submenu :index="item.id+''" v-for="item in menuList " :key="item.id">
            <!-- 一级表单模板区域 -->
            <template slot="title">
              <!-- 图标 -->
              <!-- 将item.id作为图标对象的key值，图标的类作为value，根据对象的属性，进行赋值 -->
              <!-- 只要和vue中的数据进行交互，都要进行数据的绑定 -->
              <i :class="objIcon[item.id]"></i>
              <span>{{item.authName}}</span>
            </template>
            <!-- 二级表单 -->
            <!-- 将index作为每个二级菜单跳转地址 -->
            <el-menu-item
              :index="'/'+subItem.path"
              v-for="subItem in item.children"
              :key="subItem.id"
              @click="saveActive('/'+subItem.path)"
            >
              <template slot="title">
                <!-- 图标 -->
                <i class="el-icon-menu"></i>
                {{subItem.authName}}
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 主体 -->
      <el-main>
        <!-- 路由占位符 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>
<script>
export default {
  data() {
    return {
      //定义一个空数组，接收菜单数据
      menuList: [],
      //   因为每个一级表单的图标不同，根据他的id创建一个图标的对象，如果item.id和这里面的相等就进行添加
      objIcon: {
        '125': 'iconfont icon-user',
        '103': 'iconfont icon-tijikongjian',
        '101': 'iconfont icon-shangpin',
        '102': 'iconfont icon-danju',
        '145': 'iconfont icon-baobiao'
      },
      isCollapse: false,
    //   被激活的链接
      activePath: ''
    }
  },
  // 在页面一加载就要获取菜单数据，因此定义一个生命周期函数
  created() {
    this.leftMenuList(),
    // 页面一加载，就要获得sessionStorage中保存到激活状态
      this.activePath = window.sessionStorage.getItem('activePath')
  },
  //退出功能实现
  methods: {
    logout: function() {
      //清空sessionStorage的token值
      window.sessionStorage.clear()
      //强制跳转到登录页面 响应式导航
      this.$router.push('/login')
    },
    async leftMenuList() {
      const { data: res } = await this.$http.get('menus')
      // console.log(res)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.menuList = res.data
    },
    toggleCollapse() {
      this.isCollapse = !this.isCollapse
    },
    saveActive(activePath) {
        // 将激活的列表链接保存到sessionStorage中
      window.sessionStorage.setItem('activePath', activePath)
    //   将点击的地址给当前的激活链接
      this.activePath = activePath
    }
  }
}
</script>
<style lang="less" scoped>
.homeBox {
  height: 100%;
}
.el-header {
  background: #373d41;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 0;
  color: #ffffff;
  font-size: 20px;
  div {
    display: flex;
    align-items: center;
    span {
      padding-left: 15px;
    }
  }
}
.el-aside {
  background: #333744;
  .el-menu {
    border-right: none;
  }
}
.el-main {
  background: #eaedf1;
}
.iconfont {
  margin-right: 15px;
}
.toggleBtn {
  background-color: #4a5064;
  font-size: 10px;
  line-height: 24px;
  color: #fff;
  text-align: center;
  letter-spacing: 0.2em;
  cursor: pointer;
}
</style>