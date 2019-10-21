<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb>
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getGoodsList">
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goaddpage">添加商品</el-button>
        </el-col>
      </el-row>
      <!-- 数据表格 -->
      <el-table :data="goodsList" stripe border style="width: 100%">
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="goods_name" label="商品名称" width="550"></el-table-column>
        <el-table-column prop="goods_price" label="商品价格" width="80"></el-table-column>
        <el-table-column prop="goods_weight" label="商品重量" width="100"></el-table-column>
        <el-table-column prop="add_time" label="创建时间" width="180">
          <template slot-scope="scope">{{scope.row.add_time | dateFormat}}</template>
        </el-table-column>
        <el-table-column label="编辑">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="deleteGoods(scope.row.goods_id)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[10, 20, 30, 40]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
  </div>
</template>
<script>
export default {
  data() {
    return {
      // 当前页显示的数据
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 数据列表
      goodsList: [],
      // 总的数据条数
      total: 0
    }
  },
  created() {
    this.getGoodsList()
  },
  methods: {
    //   请求数据列表
    async getGoodsList() {
      const { data: res } = await this.$http.get('goods', {
        params: this.queryInfo
      })
      //   console.log(res);
      if (res.meta.status !== 200)
        return this.$message.error('获取数据列表失败')
      this.goodsList = res.data.goods
      this.total = res.data.total
    },
    // 当前页显示条数发生变化
    handleSizeChange(newsize) {
      this.queryInfo.pagesize = newsize
      this.getGoodsList()
    },
    // 当前页变化
    handleCurrentChange(newnum) {
      this.queryInfo.pagenum = newnum
      this.getGoodsList()
    },
    // 删除商品
    deleteGoods(id) {
      this.$confirm('此操作将永久删除该数据, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          const { data: res } = await this.$http.delete('goods/' + id)
          //    console.log(res);
          if (res.meta.status !== 200) {
            return this.$message.error('删除失败')
          }
          this.$message.success('删除成功')
          this.getGoodsList()
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },
    // 路由导航跳转到添加页面
    goaddpage(){
        this.$router.push('/goods/add')
    }
  }
}
</script>
<style lang="less" scoped>
</style>
   