<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb>
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <el-alert show-icon title="注意只能选择第三级的内容" type="warning" :closable="false"></el-alert>
      <el-row class="row">
        <el-col>
          <span>选择商品分类:</span>
          <!-- 级联选择框 -->
          <el-cascader
            v-model="selectedGoodsKeys"
            :options="goodsList"
            :props="goodsProps"
            @change="handleChange"
            clearable
          ></el-cascader>
        </el-col>
      </el-row>
      <!-- tab页标签区域 -->
      <el-tabs v-model="activeName" type="card" @tab-click="handleTabClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button
            type="primary"
            size="mini"
            :disabled="isDisabled"
            @click="addDialogVisible = true"
          >添加参数</el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyTableData">
            <el-table-column type="expand">
              <!-- Tab标签 -->
              <template slot-scope="scope">
                <el-tag
                  v-for="(item, i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  @close="handleClosed(i,scope.row)"
                >{{item}}</el-tag>
                <!-- 文本输入框和新增按钮之间的切换 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  size="mini"
                  icon="el-icon-edit"
                  @click="showEditDialog(scope.row.attr_id)"
                >编辑</el-button>
                <el-button
                  type="danger"
                  size="mini"
                  icon="el-icon-danger"
                  @click="deleteData(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button
            type="primary"
            size="mini"
            :disabled="isDisabled"
            @click="addDialogVisible = true"
          >添加属性</el-button>
          <!-- 静态属性表格 -->
          <el-table :data="onlyTableData">
<el-table-column type="expand">
              <!-- Tab标签 -->
              <template slot-scope="scope">
                <el-tag
                  v-for="(item, i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  @close="handleClosed(i,scope.row)"
                >{{item}}</el-tag>
                <!-- 文本输入框和新增按钮之间的切换 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  size="mini"
                  icon="el-icon-edit"
                  @click="showEditDialog(scope.row.attr_id)"
                >编辑</el-button>
                <el-button
                  type="danger"
                  size="mini"
                  icon="el-icon-danger"
                  @click="deleteData(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加对话框 -->
    <el-dialog
      :title="'添加'+titleText"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改对话框 -->
    <el-dialog
      :title="'添加'+titleText"
      :visible.sync="modifyDialogVisible"
      width="50%"
      @close="modifyDialogClosed"
    >
      <el-form :model="modifyForm" :rules="modifyFormRules" ref="modifyFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="modifyForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="modifyDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="modifyData">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      //   商品列表
      goodsList: [],
      //   级联选择框数据配置对象
      goodsProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover'
      },
      // 被选择数据,双向绑定的数据
      selectedGoodsKeys: [],
      //   tab页双向绑定的数据,默认绑定的是first
      activeName: 'many',
      // 动态数据
      manyTableData: [],
      // 静态数据
      onlyTableData: [],
      // 控制对话框的显示隐藏
      addDialogVisible: false,
      // 添加表单双向绑定的数据
      addForm: {
        attr_name: ''
      },
      // 添加表单规则
      addFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      },
      // 控制修改按钮的显示很隐藏
      modifyDialogVisible: false,
      // 修改表单的数据绑定
      modifyForm: {
        attr_name: ''
      },
      // 修改表单规则
      modifyFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    //   获取所有的商品分类列表
    this.getCateList()
  },
  methods: {
    //   获取所有的商品分类列表
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表失败')
      }
      this.goodsList = res.data
    },
    // 级联选择项变化，会触发
    handleChange() {
      // console.log(this.selectedGoodsKeys);
      this.getParamsData()
      this.manyTableData=[]
      this.onlyTableData=[]
    },
    //
    async getParamsData() {
      // 如果被选中的长度不等于3，表示选择的范围不是第三等级的
      if (this.selectedGoodsKeys.length !== 3) {
        this.selectedGoodsKeys = []
        return
      } else {
        // 选中的是第三等级的
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          { params: { sel: this.activeName } }
        )
        if (res.meta.status !== 200) {
          this.$message.error('获取商品分类失败')
        }
        // 将得到数据进行循环，使用空格分割数据里面的vals属性，使之变成一个数组
        res.data.forEach(item => {
          // 使用三元表达式解决attr_vals为空时的
          item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
          //  将控制逻辑和输入内容绑定到每一项中
          item.inputVisible = false
          item.inputValue = ''
        })
        // console.log(res);
        // 判断获得数据是动态数据还是静态
        if (this.activeName == 'many') {
          this.manyTableData = res.data
        } else {
          this.onlyTableData = res.data
        }
      }
    },
    // // 切换tab页是触发
    handleTabClick() {
      console.log(123)
      this.getParamsData()
    },
    // 当点击添加对话框的确定按钮
    addCate() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName
          }
        )
        // console.log(res);
        if (res.meta.status !== 201) return this.$message.error('添加失败')
        this.$message.success('添加成功')
        this.addDialogVisible = false
        this.getParamsData()
      })
    },
    // 添加对话框关闭
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    // 修改按钮对话框
    async showEditDialog(id) {
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes/${id}`,
        {
          params: { attr_sel: this.activeName }
        }
      )
      // console.log(res);
      if (res.meta.status !== 200) return this.$message.error('获取失败')
      this.modifyForm = res.data
      this.modifyDialogVisible = true
    },
    // 修改数据请求
    modifyData() {
      this.$refs.modifyFormRef.validate(async valid => {
        const { data: res } = await this.$http.put(
          `categories/${this.cateId}/attributes/${this.modifyForm.attr_id}`,
          {
            attr_name: this.modifyForm.attr_name,
            attr_sel: this.activeName
          }
        )
        // console.log(res);
        if (res.meta.status !== 200) return this.$message.error('添加失败')
        this.$message.success('修改成功')
        this.getParamsData()
        this.modifyDialogVisible = false
      })
    },
    // 修改对话框关闭时
    modifyDialogClosed() {
      this.$refs.modifyFormRef.resetFields()
    },
    // 删除操作
    deleteData(id) {
      // console.log(id)

      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          const { data: res } = await this.$http.delete(
            `categories/${this.cateId}/attributes/${id}`
          )
          //  console.log(res);
          if (res.meta.status !== 200) return this.$message.error('删除失败')
          this.$message.success('删除成功')
          this.getParamsData()
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },
    // 失去焦点或者按下enter键，触发
    handleInputConfirm(row) {
        // 判断是否输入了内容
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      // 如果没有return，标明用户输入了内容，发起请求
      // 将用户输入内容添加到row中
      row.attr_vals.push(row.inputValue.trim())
      row.inputVisible = false
      this.saveTag(row)
    },
    // 参数的添加和删除的处理逻辑
    async saveTag(row) {
      const { data: res } = await this.$http.put(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(' ')
        }
      )
      // console.log(res)
      if (res.meta.status !== 200) return this.$message.error('修改失败')
      this.$message.success('修改成功')
      row.inputValue = ''
    },
    // 删除参数处理
    handleClosed(i, row) {
      row.attr_vals.splice(i, 1)
      this.saveTag(row)
    },
    // 点击显示输入框
    showInput(row) {
      row.inputVisible = true
      // $nextTick 当页面中的元素被重新渲染之后，才会执行回调函数中的代码
      this.$nextTick(_ => {
        // 点击添加之后，出现文本框自动获取焦点
        this.$refs.saveTagInput.$refs.input.focus()
      })
    }
  },
  //  定义一个计算属性
  computed: {
    isDisabled() {
      if (this.selectedGoodsKeys.length !== 3) {
        return true
      }
      return false
    },
    //获取被选中的id，返回的影视级联选择器的最后一个id
    cateId() {
      if (this.selectedGoodsKeys.length === 3) {
        return this.selectedGoodsKeys[2]
      }
      return null
    },
    // 添加对话框的title
    titleText() {
      if (this.activeName == 'many') {
        return '动态参数'
      } else {
        return '静态属性'
      }
    }
  }
}
</script>
<style lang="less" scoped>
.row {
  margin-top: 15px;
}
.el-cascader {
  padding-left: 15px;
  width: 70%;
}
.el-tag {
  margin: 10px;
}
.input-new-tag {
  width: 120px;
}
</style>