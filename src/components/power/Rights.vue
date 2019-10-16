<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <el-table :data="rightList" border stripe>
          <el-table-column type='index'></el-table-column>
        <el-table-column prop="authName" label="权限名称" ></el-table-column>
        <el-table-column prop="path" label="路径" ></el-table-column>
        <el-table-column prop="level" label="权限等级">
            <!-- 渲染权限等级列表，使用插槽方式 -->
            <template slot-scope="scope">
                <el-tag v-if="scope.row.level==0">一级</el-tag>
                <el-tag type="success" v-if="scope.row.level==1">二级</el-tag>
                <el-tag type="warning" v-if="scope.row.level==2">三级</el-tag>
            </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>
<script>
export default {
  data() {
    return {
      // 权限列表
      rightList: []
    }
  },
  created() {
    // 获取权限列表
    this.powerList()
  },
  methods: {
    async powerList() {
        // 发送数据请求获取权限列表
      const { data: res } = await this.$http.get('rights/list')
    //   console.log(res)
      if (res.meta.status !== 200)
        return this.$message.error('获取权限列表失败')
      this.rightList = res.data
    }
  }
}
</script>
<style lang="less" scoped>
</style>