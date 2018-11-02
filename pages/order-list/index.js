var wxpay = require('../../utils/pay.js')
var app = getApp()
Page({
  data: {
    statusType: [{
      id: 1,
      name: "待付款"
    }, {
      id: 2,
      name: "待发货"
    }, {
      id: 3,
      name: "待收货"
    }, {
      id: 4,
      name: "待评价"
    }, {
      id: 0,
      name: "已完成"
    }],
    statusType1: ["已完成", "待付款","待发货","待收货","待评价"],
    currentType: 0,
    tabClass: ["", "", "", "", ""],
    orderListShow: [],

  },
  //点击tab栏
  statusTap: function(e) {
    var curType = e.currentTarget.dataset.index;

    //筛选出所需数据
    var orderData = this.data.orderList
    var id = this.data.statusType[e.currentTarget.dataset.index].id
    this.setData({
      currentType: curType,
      activeId: id
    });
    var list = orderData.filter(function(value) {
      return value.orderStatus == id;
    });

    this.showPic(list)
    //对数据处理，前端做处理，点击切换数据

    //获取相应tab下的数据
    // this.onShow();
  },

  //获取展示按钮状态
  showPic: function(list) {

    for (var i = 0; i < list.length; i++) {

      if (1 <= list[i].orderStatus <= 3) {
        list[i].show = false
      }

      list[i].date = list[i].confirmTime.slice(0, 10)
      list[i].time = list[i].confirmTime.slice(11, 19)
    }
    this.setData({
      orderListShow: list
    })
  },
  //点击订单前往订单详情页
  orderDetail: function(e) {
    var orderId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: "/pages/order-details/index?id=" + orderId
    })
  },
  //点击取消订单
  cancelOrderTap: function(e) {
    var that = this;
    var orderId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确定要取消该订单吗？',
      content: '',
      success: function(res) {
        if (res.confirm) {
          wx.showLoading();
          wx.request({
            //取消订单
            url: 'http://47.99.112.182:4030/v1/order/' + orderId,
            method:'DELETE',
            success: (res) => {
              wx.hideLoading();
              if (res.data.code == 0) {
                that.onShow();
              }
            }
          })
        }
      }
    })
  },
  //点击付款
  toPayTap: function(e) {
    var that = this;
    var orderId = e.currentTarget.dataset.id;
    var money = e.currentTarget.dataset.money;
    var needScore = e.currentTarget.dataset.score;
    wxpay.wxpay(app, money, orderId, "/pages/order-list/index");
  },
  onLoad: function(options) {
    // 生命周期函数--监听页面加载

  },
  onReady: function() {
    // 生命周期函数--监听页面初次渲染完成

  },
  //获取tab栏提示   暂无需求
  // getOrderStatistics : function () {
  //   var that = this;
  //   wx.request({
  //     //订单数据统计接口
  //     url: 'https://api.it120.cc/' + app.globalData.subDomain + '/order/statistics',
  //     data: { token: wx.getStorageSync('token') },
  //     success: (res) => {
  //       wx.hideLoading();
  //       //判断是否有新订单的提醒
  //       if (res.data.code == 0) {
  //         var tabClass = that.data.tabClass;
  //         if (res.data.data.count_id_no_pay > 0) {
  //           tabClass[0] = "red-dot"
  //         } else {
  //           tabClass[0] = ""
  //         }
  //         if (res.data.data.count_id_no_transfer > 0) {
  //           tabClass[1] = "red-dot"
  //         } else {
  //           tabClass[1] = ""
  //         }
  //         if (res.data.data.count_id_no_confirm > 0) {
  //           tabClass[2] = "red-dot"
  //         } else {
  //           tabClass[2] = ""
  //         }
  //         if (res.data.data.count_id_no_reputation > 0) {
  //           tabClass[3] = "red-dot"
  //         } else {
  //           tabClass[3] = ""
  //         }
  //         if (res.data.data.count_id_success > 0) {
  //           //tabClass[4] = "red-dot"
  //         } else {
  //           //tabClass[4] = ""
  //         }

  //         that.setData({
  //           tabClass: tabClass,
  //         });
  //       }
  //     }
  //   })
  // },
  onShow: function() {
    // 获取订单列表
    wx.showLoading();
    var that = this;
    // postData.status = that.data.currentType;
    //获取tab提示
    // this.getOrderStatistics();


    wx.request({
      //获取相应tab下的数据
      url: 'http://47.99.112.182:4030/v1/order/query',
      method: 'POST',
      data: {
        userID: wx.getStorageSync('user').id
      },
      success: (res) => {
        wx.hideLoading();
        if (res.data.code == 0) {
          that.setData({
            orderList: res.data.data, //先写成本地静态数据
          });
          var list = res.data.data.filter(function(value) {
            return value.orderStatus == '1';
          });
          this.setData({
            orderListShow: list
          })

          this.showPic(list)
        } else {
          this.setData({
            // orderList: null,
            goodsMap: {}
          });
        }
      }
    })
  },
  onHide: function() {
    // 生命周期函数--监听页面隐藏

  },
  onUnload: function() {
    // 生命周期函数--监听页面卸载

  },
  onPullDownRefresh: function() {
    // 页面相关事件处理函数--监听用户下拉动作

  },
  onReachBottom: function() {
    // 页面上拉触底事件的处理函数

  }
})