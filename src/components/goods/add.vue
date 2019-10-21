<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb>
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 提示区域 -->
      <el-alert title="添加商品" type="info" center show-icon :closable="false"></el-alert>
      <!-- 进度条 -->
      <el-steps :space="200" :active="activeIndex-0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- 左侧tab栏区域 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
        label-position="top"
      >
        <el-tabs
          v-model="activeIndex"
          :tab-position="'left'"
          :before-leave="brforeTabsLeave"
          @tab-click="changeTabs"
        >
          <el-tab-pane label="基本信息" name="0">
            基本信息
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="addForm.goods_cat"
                :options="cateList"
                :props="cateProps"
                @change="handleChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!-- 渲染表单的Item项 -->
            <el-form-item
              :label="item1.attr_name"
              v-for="item1 in manyTableData"
              :key="item1.attr_id"
              border
            >
              <el-checkbox-group v-model="item1.attr_vals">
                <el-checkbox :label="item2" v-for="(item2,i) in item1.attr_vals " :key="i"></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item
              :label="item.attr_name"
              v-for="item in onlyTableData"
              :key="item.attr_id"
              border
            >
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- action 表示图片要上传的后天api地址 -->
            <el-upload
              :action="uploadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headersObj"
              :on-success="handleSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <el-button type="primary" class="addBtn" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 预览图片的对话框 -->
    <el-dialog title="图片预览" :visible.sync="previewDialogVisible" width="50%">
      <img :src="previewPath" alt />
    </el-dialog>
  </div>
</template>
<script>
import _ from 'lodash'
export default {
  data() {
    return {
      // 进度条进行到第几步的索引
      activeIndex: '0',
      // 表单的绑定数据
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        // 选中的商品分类
        goods_cat: [],
        // 图片上传的地址
        pics: [],
        // 商品描述
        goods_introduce: '',
        attrs: []
      },
      // 表单验证规则
      addFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请选择商品分类', trigger: 'blur' }
        ]
      },
      //   商品分类列表
      cateList: [],
      //   选中商品分类
      goodsCateId: [],
      //   商品分类的数据对象
      cateProps: {
        // 选中的内容的标志
        value: 'cat_id',
        // 选中显示的内容
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover',
        checkStrictly: true
      },
      //   动态参数的数据
      manyTableData: [],
      //   静态属性数据
      onlyTableData: [],
      // 图片上传的后台地址
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 图片上传是的请求头
      headersObj: {
        Authorization: window.sessionStorage.getItem('key')
      },
      // 预览图片的路径
      previewPath: '',
      // 预览图片对话框显示隐藏
      previewDialogVisible: false
    }
  },
  created() {
    //   获取所有商品的列表
    this.getCateList()
  },
  methods: {
    //   获取所有商品的列表
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200)
        return this.$message.error('获取商品分类失败')
      this.cateList = res.data
    },
    // 级联选择框发生变化时
    handleChange() {
      // 控制级联选择框只能选择第三级的元素
      if (this.addForm.goods_cat.length === 3) {
        // console.log(this.addForm.goods_cat);
      } else {
        this.addForm.goods_cat = []
      }
    },
    // 阻止在没有选中商品分类时发生标签页的切换
    brforeTabsLeave(activeIndex, oldactiveIndex) {
      if (this.activeIndex == 0 && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请选择商品分类')
        return false
      }
    },
    // 切换标签触发
    async changeTabs() {
      // 判断此时是否进入商品参数页面
      if (this.activeIndex === '1') {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: {
              sel: 'many'
            }
          }
        )
        if (res.meta.status !== 200)
          return this.$message.error('获取动态参数失败')
        // console.log(res.data);
        // 对attr_vals进行循环，使其变为一个数组
        res.data.forEach(item => {
          // 先判断attr_vals是否存在
          item.attr_vals =
            item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
        })
        this.manyTableData = res.data
        this.activeIndex = '1'
      } else if (this.activeIndex === '2') {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: {
              sel: 'only'
            }
          }
        )
        if (res.meta.status !== 200)
          return this.$message.error('获取静态属性失败')
        //   console.log(res.data);

        this.onlyTableData = res.data
        this.activeIndex = '2'
      }
    },
    // 点击图片，进行预览图片时触发
    handlePreview(file) {
      this.previewPath = file.response.data.url
      this.previewDialogVisible = true
    },
    // 删除图片时触发
    handleRemove(file) {
      // 1.获取删除图片的路径
      // console.log(file);
      const filePath = file.response.data.tmp_path
      // 2.找出要删除图片的索引值
      const index = this.addForm.pics.findIndex(item => item.pic == filePath)
      // 3.利用数组中的splice删除图片
      this.addForm.pics.splice(index, 1)
      // console.log(this.addForm);
    },
    // 图片上传成功调用的函数
    handleSuccess(response) {
      // console.log(response);
      // 1.拼接得到一个图片的信息
      const picInfo = {
        pic: response.data.tmp_path
      }
      // 2.将图片信息添加到pics数组中
      this.addForm.pics.push(picInfo)
      this.activeIndex = '3'
    },
    // 添加商品
    add() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('请填写必填项')
        }
        // 因为在添加的时候，要求传递的是一个字符串，所以
        // 使用lodash中的cloneDeep进行深拷贝在进行操作
        const form = _.cloneDeep(this.addForm)
        form.goods_cat = form.goods_cat.join(',')
        // 处理动态参数
        this.manyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(',')
          }
          this.addForm.attrs.push(newInfo)
        })
        // 静态属性
        this.onlyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          this.addForm.attrs.push(newInfo)
        })
        form.attrs = this.addForm.attrs
        const { data: res } = await this.$http.post('goods', form)
        // console.log(res);
        if (res.meta.status !== 201) {
          return this.$message.error('添加商品失败')
        }
        this.$message.success('添加商品成功')
        this.$router.push('/goods')
      })
    }
  },
  //   计算属性
  computed: {
    // 此时被选中的三级商品分类的id
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
    }
  }
}
</script>
<style lang="less" scoped>
.el-checkbox {
  margin: 0 10px 0 0 !important;
}
.addBtn {
  margin-top: 15px;
}
</style>