<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>角色管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!--添加用户按钮  -->
      <el-row>
        <el-col>
          <el-button type="primary">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 数据展示区域 -->
      <el-table :data="roleListForm" stripe border>
        <!-- 伸缩列表 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['bdbottom',index1==0?'border-top':'','vcenter']"
              v-for="(item1,index1) in scope.row.children"
              :key="item1.id"
            >
              <el-col :span="5">
                <!-- 一级权限 -->
                <el-tag closable @close="deleteTag(scope.row.id,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 二级权限 -->
              <el-col :span="19">
                <el-row
                  :class="[index2==0?'':'bdtop','vcenter']"
                  v-for="(item2,index2) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="deleteTag(scope.row.id,item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 三级权限 -->
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      v-for="(item3) in item2.children"
                      :key="item3.id"
                      closable
                      @close="deleteTag(scope.row,item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作">
          <!-- scope.row有所有信息，里面的id可用于下面的三个功能参数的传递 -->
          <template slot-scope="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
            <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
            <el-button
              size="mini"
              type="warning"
              icon="el-icon-setting"
              @click="showSetRightDialog(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 分配权限对话框 -->
    <el-dialog title="修改权限" :visible.sync="rightDialog" width="50%" @close="setRightClosed">
      <!-- 树形控件 -->
      <el-tree
        :data="rightListDialog"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="treeDef"
        ref="treeRef"
      ></el-tree>
      <span slot="footer">
        <el-button @click="rightDialog = false">取 消</el-button>
        <el-button type="primary" @click="treeRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      roleListForm: [],
      rightDialog: false,
      rightListDialog: [],
      //   树形控件绑定的事件对象
      treeProps: {
        children: 'children',
        label: 'authName'
      },
      //   树形控件默认选中的数组id
      treeDef: [],
      // 当前要进行修改权限的id
      roleId: ''
    }
  },
  created() {
    this.roleList()
  },
  methods: {
    roleList: async function() {
      const { data: res } = await this.$http.get('roles')
      // console.log(res);
      this.roleListForm = res.data
    },
    // 删除权限按钮
    deleteTag: function(role, rightId) {
      //    console.log(roleId,rightId);
      this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          // 发送删除权限请求
          const { data: res } = await this.$http.delete(
            `roles/${role.id}/rights/${rightId}`
          )
          // console.log(res);
          if (res.meta.status !== 200)
            return this.$message.error('取消权限失败')
          // this.roleList()
          // 防止删除成功后，页面关闭
          role.children = res.data
          this.$message.success('取消权限成功')
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },
    showSetRightDialog: async function(role) {
      this.roleId = role.id
      // 获取树形权限列表
      const { data: res } = await this.$http.get('rights/tree')
      //  console.log(res);
      if (res.meta.status !== 200)
        return this.$message.error('获取权限列表失败')
      this.rightListDialog = res.data
      this.getLeafKeys(role, this.treeDef)
      //  console.log(this.rightListDialog);
      this.rightDialog = true
    },
    // 使用递归函数循环角色的children属性
    getLeafKeys: function(node, arr) {
      if (!node.children) {
        // 如果此节点中没有children属性，就是三级节点，就把其中的id添加到数组中
        return arr.push(node.id)
      }
      // 将三级节点的id保存到treeDef数组中
      // 循环node中的children节点
      node.children.forEach(item => {
        this.getLeafKeys(item, arr)
      })
    },
    // 监听权限对话框的关闭
    setRightClosed() {
      this.treeDef = []
    },
    // 点击为角色分配权限
    async treeRights() {
      // 获取到被选中的权限id
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        { rids: idStr }
      )
      // console.log(keys);
      if (res.meta.status !== 200) return this.$message.error('分配权限失败')
      this.rightDialog = false
      this.roleList()
      this.$message.success('分配权限成功')
      // console.log(res);
    }
  }
}
</script>
<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eeeeee;
}
.bdbottom {
  border-bottom: 1px solid #eeeeee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>