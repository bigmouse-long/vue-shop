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
      <el-row>
        <el-col>
          <el-button type="primary" @click="addCates">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 商品区域 -->
      <tree-table
        class="treeTable"
        :data="cataList"
        :columns="columns"
        :show-index="true"
        border
        :show-row-hover="false"
        :expand-type="false"
        :selection-type="false"
      >
        <!-- 是否有效 -->
        <template slot="isOk" slot-scope="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted===false" style="color:lightgreen"></i>
          <i class="el-icon-error" v-else style="color:red"></i>
        </template>
        <!-- 排序 -->
        <template slot="sort" slot-scope="scope">
          <el-tag type="success" v-if="scope.row.cat_level===0" size="mini">一级</el-tag>
          <el-tag type="danger" v-else-if="scope.row.cat_level===1" size="mini">二级</el-tag>
          <el-tag type="warning" v-else size="mini">三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="operation" slot-scope="scope">
          <el-button
            type="primary"
            icon="el-icon-edit"
            size="mini"
            @click="modifyCate(scope.row.cat_id)"
          >编辑</el-button>
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
            @click="deleteCate(scope.row.cat_id)"
          >删除</el-button>
        </template>
      </tree-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 6, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="totalPage"
      ></el-pagination>
    </el-card>
    <!-- 添加商品分类对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="addCateFromReset"
    >
      <el-form ref="addCateRef" :model="addCateForm" :rules="addCateRules" label-width="80px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父类层级">
          <!-- options 用来指定数据源 -->
          <!-- props 用来指定配置对象 -->
          <el-cascader
            :options="parentCateList"
            :props="cascaderProps"
            v-model="selectedKeys"
            @change="parentCateChanged"
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改分类对话框 -->
    <!-- 添加商品分类对话框 -->
    <el-dialog
      title="修改分类"
      :visible.sync="modifyCateDialogVisible"
      width="50%"
      @close="modifyCateFromReset"
    >
      <el-form ref="modifyCateRef" :model="modifyCateForm" :rules="addCateRules" label-width="80px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="modifyCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="modifyCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate(modifyCateForm.id)">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 商品列表
      cataList: [],
      // 总的数据条数
      totalPage: 0,
      //   商品表格展示
      columns: [
        {
          label: '商品名称',
          prop: 'cat_name'
        },
        // 自定义模板列，使用具名插槽的方式
        {
          label: '是否有效',
          type: 'template',
          template: 'isOk'
        },
        {
          label: '排序',
          type: 'template',
          template: 'sort'
        },
        {
          label: '操作',
          type: 'template',
          template: 'operation'
        }
      ],
      //   控制添加分类对话框的显示与隐藏
      addCateDialogVisible: false,
      // 添加分类表单的数据对象
      addCateForm: {
        cat_name: '',
        // 父类id
        cat_pid: 0,
        // 分类层级
        cat_level: 0
      },
      // 添加分类表单的规则
      addCateRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      //   父级分类列表
      parentCateList: [],
      //   父级的分类的选中对象
      cascaderProps: {
        // 指定选项的值为选项对象的某个属性值
        value: 'cat_id',
        // 	指定选项标签为选项对象的某个属性值
        label: 'cat_name',
        // 指定选项的子选项为选项对象的某个属性值
        children: 'children',
        // 展开方式
        expandTrigger: 'hover',
        checkStrictly: true
      },
      //选中的父级分类的id数组
      selectedKeys: [],
      // 控制修改分类对话框
      modifyCateDialogVisible: false,
      modifyCateForm: {
        cat_name: '',
        id: 0
      }
    }
  },
  created() {
    // 获取商品列表
    this.getCataList()
  },
  methods: {
    // 获取商品列表
    async getCataList() {
      const { data: res } = await this.$http.get('categories', {
        params: this.queryInfo
      })
      //  console.log(res.data.total);
      if (res.meta.status !== 200)
        return this.$message.error('获取商品列表失败')
      this.cataList = res.data.result
      this.totalPage = res.data.total
    },
    // 监听每页显示的数据条数的变化
    handleSizeChange(newsize) {
      this.queryInfo.pagesize = newsize
      this.getCataList()
    },
    // 监听页码的改变
    handleCurrentChange(newpage) {
      this.queryInfo.pagenum = newpage
      this.getCataList()
    },
    // 添加对话框的显示
    addCates() {
      this.addCateDialogVisible = true
      this.getParentCateList()
    },
    // 获取父级的分类列表
    async getParentCateList() {
      // 获取前两级的所有分类
      const { data: res } = await this.$http.get('categories', {
        params: { type: 2 }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类数据失败！')
      }

      //   console.log(res.data);
      this.parentCateList = res.data
      // console.log(this.parentCateList)
    },
    // 父类选择框选中时
    // 选择项发生变化触发这个函数
    parentCateChanged() {
      console.log(this.selectedKeys)
      // 如果 selectedKeys 数组中的 length 大于0，证明选中的父级分类
      // 反之，就说明没有选中任何父级分类
      if (this.selectedKeys.length > 0) {
        // 父级分类的Id
        this.addCateForm.cat_pid = this.selectedKeys[
          this.selectedKeys.length - 1
        ]
        // 为当前分类的等级赋值
        this.addCateForm.cat_level = this.selectedKeys.length
        return
      } else {
        // 父级分类的Id
        this.addCateForm.cat_pid = 0
        // 为当前分类的等级赋值
        this.addCateForm.cat_level = 0
      }
    },
    // 添加分类
    addCate() {
      // console.log(123);
      console.log(this)

      console.log(this.addCateForm)
      this.$refs.addCateRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post(
          'categories',
          this.addCateForm
        )
        //  console.log(res);
        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败！')
        }
        this.$message.success('添加分类成功！')
        this.getCataList()
        this.addCateDialogVisible = false
      })
    },
    // 关闭表单重置表单
    addCateFromReset() {
      this.$refs.addCateRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
    },
    // 删除分类
    async deleteCate(id) {
      const confirmResult = await this.$confirm(
        '此操作将删除该分类，是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      // 如果用户确认删除，则返回值为字符串 confirm
      // 如果用户取消了删除，则返回值为字符串 cancel);
      if (confirmResult != 'confirm') return this.$message.info('已取消删除')
      const { data: res } = await this.$http.delete('categories/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除分类信息失败')
      }
      this.$message.success('删除分类信息成功')
      this.getCataList()
    },
    // 修改分类
    async modifyCate(id) {
      const { data: res } = await this.$http.get('categories/' + id)
      // console.log(res);
      if (res.meta.status !== 200) {
        return this.$message.error('获取信息失败')
      }
      this.modifyCateForm.cat_name = res.data.cat_name
      this.modifyCateForm.id = id
      this.modifyCateDialogVisible = true
    },
    // 重置表单
    modifyCateFromReset() {
      this.$refs.modifyCateRef.resetFields()
    },
    // 点击确定，完成编辑分类
    async editCate(id) {
      // console.log(this.modifyCateForm.id);
      // console.log(this.modifyCateForm.cat_name);
      const { data: res } = await this.$http.put('categories/' + id, {
        cat_name: this.modifyCateForm.cat_name
      })
      if (res.meta.status !== 200) {
        return this.$message.error('更新失败')
      }
      this.$message.success('更新信息成功')
      this.getCataList()
      this.modifyCateDialogVisible = false
    }
  }
}
</script>
<style lang="less" scoped>
.treeTable {
  margin-top: 15px;
}
.el-cascader {
  width: 100%;
}
</style>