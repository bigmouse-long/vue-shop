<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryParams.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible=true">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 渲染用户列表数据 -->
      <el-table :data="userList" stripe border>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="username" label="姓名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column label="状态">
          <!-- 通过作用域插槽获得当前的所有数据 -->
          <template slot-scope="scope">
            <!-- scope.row 是当前数据的所有信息 -->
            <el-switch v-model="scope.row.mg_state" @change="userState(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <!-- 添加按钮 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="editUser(scope.row.id)"
            ></el-button>
            <!-- 删除按钮 -->
            <el-button type="danger" icon="el-icon-delete" size="mini"  @click="deleteUser(scope.row.id)"></el-button>
            <!-- 分配角色按钮 -->
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryParams.pagenum"
        :page-sizes="[1, 2, 3, 4]"
        :page-size="queryParams.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 添加用户的对话框 -->
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="addFormClosed">
      <span>
        <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="addForm.username"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="addForm.password"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="addForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机号" prop="mobile">
            <el-input v-model="addForm.mobile "></el-input>
          </el-form-item>
        </el-form>
      </span>
      <span slot="footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改用户对话框 -->
    <el-dialog title="修改用户" :visible.sync="editUserVisible" width="50%" @close="editClosed">
      <span>
        <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
          <el-form-item label="用户名">
            <el-input v-model="editForm.username" disabled></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="editForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机号" prop="mobile">
            <el-input v-model="editForm.mobile"></el-input>
          </el-form-item>
        </el-form>
      </span>
      <span slot="footer">
        <el-button @click="editUserVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo(editForm.id)">确 定</el-button>
      </span>
    </el-dialog>
  
    
  </div>
</template>
<script>
import { async } from 'q'
export default {
  data() {
    // 自定义邮箱验证规则
    var checkEmail = (rule, value, callback) => {
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      if (regEmail.test(value)) {
        callback()
      } else {
        return callback(new Error('请输入正确的邮箱规则'))
      }
    }
    // 自定义手机验证规则
    var checkMobile = (rule, value, callback) => {
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      if (regMobile.test(value)) {
        callback()
      } else {
        return callback(new Error('请输入正确的手机号'))
      }
    }
    return {
      // 定义请求参数
      queryParams: {
        query: '',
        // 当前页
        pagenum: 1,
        //每页显示几条数据
        pagesize: 2
      },
      userList: [],
      // 总数据条数
      total: 0,
      // 控制添加用户的对话框的显示和隐藏
      addDialogVisible: false,
      // 用户添加表单
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 添加用户表单的定义规则
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          {
            min: 3,
            max: 10,
            message: '用户名的长度在3~10个字符之间',
            trigger: 'blur'
          }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          {
            min: 6,
            max: 15,
            message: '用户名的长度在6~15个字符之间',
            trigger: 'blur'
          }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          // 自定义邮箱的使用规则
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 控制修改用户对话框的显示，隐藏
      editUserVisible: false,
      // 接收要修改的用户信息
      editForm: {},
      // 修改用户信息的表单验证规则
      editFormRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          // 自定义邮箱的使用规则
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    // 在页面已加载就要获取用户列表数据
    this.getUserList()
  },
  methods: {
    getUserList: async function() {
      const { data: res } = await this.$http.get('users', {
        params: this.queryParams
      })
      // console.log(res)
      if (res.meta.status !== 200)
        return this.$message.error('获取用户列表数据失败')
      this.userList = res.data.users
      this.total = res.data.total
    },
    // 获取到新的当前页显示条数，当前页码的改变
    handleSizeChange: function(newSize) {
      // console.log(newSize);
      this.queryParams.pagesize = newSize
      this.getUserList()
    },
    // 获取到新的当前页数，当前页码显示条数的改变
    handleCurrentChange: function(newPage) {
      // console.log(newPage);
      this.queryParams.pagenum = newPage
      this.getUserList()
    },
    userState: async function(userInfo) {
      const { data: res } = await this.$http.put(
        `users/${userInfo.id}/state/${userInfo.mg_state}`
      )
      if (res.meta.status !== 200) {
        userInfo.mg_state = !userInfo.mg_state
        return this.$message.error('更新用户状态失败')
      } else {
        return this.$message.success('更新用户状态成功')
      }
    },
    // 添加用户表单关闭后进行重置表单
    addFormClosed() {
      // console.log(this);
      this.$refs.addFormRef.resetFields()
    },
    // 表单预验证
    addUser: function() {
      this.$refs.addFormRef.validate(async valid => {
        // console.log(valid);
        // 预验证失败，不能添加
        if (!valid) return
        // 验证通过，可以发送添加用户请求
        const { data: res } = await this.$http.post('users', this.addForm)
        console.log(res)
        if (res.meta.status !== 201) return this.$message.error('用户创建失败')
        this.$message.success('用户创建成功')
        // 添加文本框隐藏
        this.addDialogVisible = false
        // 更新用户列表
        this.getUserList()
      })
    },
    // 修改用户按钮,展示修改用户对话框
    editUser: async function(id) {
      // 获取修改用户信息
      // console.log(id);
      const { data: res } = await this.$http.get('users/' + id)
      // console.log(res);
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户信息失败')
      }
      this.editForm = res.data

      this.editUserVisible = true
    },
    // 修改用户表单信息关闭重置
    editClosed() {
      // console.log(this);
      this.$refs.editFormRef.resetFields()
    },
    // 修改用户信息的表单预验证
    editUserInfo(id){
this.$refs.editFormRef.validate(async valid=>{
  // console.log(valid);
    // 预验证失败，不能添加
        if (!valid) return
        // 获取修改用户id
        // console.log(id);
        
        // 验证通过，可以发送修改用户请求
        const {data:res}=await this.$http.put('users/'+id,this.editForm)
        // console.log(res);
        if(res.meta.status!==200) return this.$message.error('修改用户信息失败')
        // 重新获取用户列表
        this.getUserList()
        // 关闭修改用户表单
        this.editUserVisible = false
        this.$message.success('修改用户信息成功')
        
})
    } ,
    // 删除用户
    deleteUser(id){
      // console.log(id);
       this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async() => {
          console.log(id);
          const {data:res}=await this.$http.delete('users/'+id)
          if(res.meta.status!==200) return this.$message.error('删除用户信息失败')
        // 重新获取用户列表
        this.getUserList()
        this.$message.success('删除用户信息成功')
          
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });          
        });
    },
   

     }
}
</script>
<style lang="less" scoped>
</style>