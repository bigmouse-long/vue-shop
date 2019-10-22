<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容" >
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!-- 订单列表数据 -->
          <el-table
      :data="orderList"
      style="width: 100%">
      <el-table-column type="index"></el-table-column></el-table-column>
      <el-table-column
        prop="order_number"
        label="订单编号" width="200px">
      </el-table-column>
        <el-table-column
        prop="order_price"
        label="订单价格">
      </el-table-column>
      <el-table-column
        prop="pay_status"
        label="是否付款">
              <template slot-scope="scope">
<el-tag type="success" v-if="scope.row.pay_status==='1'">已付款</el-tag>       
<el-tag type="danger" v-else>未付款</el-tag>       
 </template>
      </el-table-column>
        <el-table-column
        prop="is_send"
        label="是否发货">
        <template slot-scope="scope">
            {{scope.row.is_send}}
        </template>
        </el-table-column>
      <el-table-column
        prop="create_time"
        label="下单时间">
        <template slot-scope="scope">
            {{scope.row.create_time | dateFormat}}
        </template>
      </el-table-column>
      <el-table-column label="操作">
      <template slot-scope="scope">
          <el-button type="primary" size="mini" icon="el-icon-edit" @click="addAddress"></el-button>
          <el-button type="success" size="mini"  icon="el-icon-location-outline" @click="showProcessDialog"></el-button>
      </template>
         </el-table-column>
    </el-table>
    <!-- 分页 -->
     <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum"
      :page-sizes="[5, 8, 6, 10]"
      :page-size="queryInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
    </el-pagination>
    </el-card>
    <!-- 填写地址的对话框 -->
    <el-dialog
  title="填写地址"
  :visible.sync="addressDialogVisible"
  width="50%"
  @close="addressDialogClosed">
    <el-form :model="addressForm" :rules="addressFormRules" ref="addressFormRef" label-width="100px">
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader :options="cityData" v-model="addressForm.address1"></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addressForm.address2"></el-input>
        </el-form-item>
      </el-form>
  <span slot="footer" >
    <el-button @click="addressDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addressDialogVisible = false">确 定</el-button>
  </span>
</el-dialog>
<!-- 展示物流进度的对话框 -->
<el-dialog
  title="物流进度"
  :visible.sync="processDialogVisible"
  width="50%">
   <el-timeline>
    <el-timeline-item
      v-for="(activity, index) in processData"
      :key="index"
      :timestamp="activity.time">
      {{activity.context}}
    </el-timeline-item>
  </el-timeline>
</el-dialog>
  </div>
</template>
<script>
import cityData from './citydata.js'
export default {
    data(){
        return {
            // 订单查询列表数据
            queryInfo:{
                query:'',
                pagenum:1,
                pagesize:10
            },
            // 数据总数
            total:0,
            // 数据列表
            orderList:[],
            // 控制填写地址对话框的显示隐藏
            addressDialogVisible:false,
            // 省市区数据
            cityData,
            // 级联选择框绑定内容
            addressForm: {
        address1: [],
        address2: ''
      },
      addressFormRules: {
        address1: [
          { required: true, message: '请选择省市区县', trigger: 'blur' }
        ],
        address2: [
          { required: true, message: '请填写详细地址', trigger: 'blur' }
        ]
      },
      // 物流对话框的显示隐藏
      processDialogVisible:false,
      // 物流数据
      processData:[]
        }
    },
    created(){
        this.getOrderList()
    },
    methods:{
        async getOrderList(){
         const {data:res}=await this.$http.get('orders',{params:this.queryInfo})
        if(res.meta.status!==200) return this.$message.error('获取订单数据列表失败')
        this.total=res.data.total;
        this.orderList=res.data.goods
        // console.log (res);
        
        },
        // 页面显示数据的大小发生变化
        handleSizeChange(newsize){
            this.queryInfo.pagesize=newsize
            this.getOrderList()
        },
        // 页码发生变化
        handleCurrentChange(newpage){
            this.queryInfo.pagenum=newpage
            this.getOrderList()
        },
        // 点击添加地址按钮
        addAddress(){
            this.addressDialogVisible=true;
        },
        // 地址对话框关闭事件
        addressDialogClosed(){
          this.$refs.addressFormRef.resetFields()
        },
        // 展示物流对话框
       async showProcessDialog(){
        const {data:res}=await this.$http.get('/kuaidi/1106975712662')
        if(res.meta.status!==200) return this.$message.error('获取订单物流失败')
        this.processData=res.data;
         this.processDialogVisible=true;
        }
        
    }
}
</script>
<style lang="less" scoped>
@import '../../plugins/timeline/timeline.css';
@import '../../plugins/timeline-item/timeline-item.css';
</style>