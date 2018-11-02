var app = getApp();

Page({
  data: {
    orderId: 0,
    statusType: ["已完成", "待付款", "待发货", "待收货", "待评价", ],
    yunPrice: 0.00,
  },
  //读取订单id
  onLoad: function(e) {
    let orderId = parseInt(e.id)

    this.setData({
      orderId: orderId
    });
  },
  onShow: function() {

    var that = this;
    //获取商品详情
    wx.request({
      //获取订单商品列表  /order/:id
      url: 'http://47.99.112.182:4030/v1/order/' + that.data.orderId,

      success: (res) => {
        that.setData({
          order: res.data.data
        })

        //获取地址，获取快递
        wx.request({
          //获取订单商品列表  /order/:id
          url: 'http://47.99.112.182:4030/v1/order/' + that.data.orderId,

          success: (res) => {
            that.setData({
              order: res.data.data
            })

            wx.request({
              //获取订单商品列表  /order/:id
              url: 'http://47.99.112.182:4030/v1/address/' + res.data.data.addressId,

              success: (res) => {
                that.setData({
                  linkMan: res.data.data.consignee,
                  phone: res.data.data.phone,
                  address: res.data.data.address,
                })
              }
            })

          }
        })
      }
    })
    wx.request({
      //获取订单商品列表  /orderrec/query
      url: 'http://47.99.112.182:4030/v1/orderrec/query',
      method: 'POST',
      data: {
        orderId: that.data.orderId,
      },
      success: (res) => {
        wx.hideLoading();
        if (res.data.code != 0) {
          wx.showModal({
            title: '错误',
            content: res.data.msg,
            showCancel: false
          })
          return;
        }
        that.setData({
          orderDetail: res.data.data
        });
        console.log(that.data)
        that.countMoney()
      }
    })

    // wx.request({
    //   //获取订单物流相关  /shipping/:id
    //   url: 'https://api.it120.cc/' + app.globalData.subDomain + '/order/statistics',
    //   data: {
    //     id: that.data.shippingId,
    //   },
    //   success: (res) => {

    //   }
    // })

    // this.setData({
    //   linkMan: shippingData.consignee,
    //   phone: shippingData.phone,
    //   address: shippingData.address,
    //   yunPrice: shippingData.shippingFee
    // })

    that.countMoney()
  },
  countMoney: function() {

    //计算总价
    if (this.data.orderDetail) {
      var yunPrice = parseFloat(this.data.yunPrice);
      var allprice = 0;
      var goodsList = this.data.orderDetail;
      for (var i = 0; i < goodsList.length; i++) {
        allprice += parseFloat(goodsList[i].price) * goodsList[i].count;
      }
      console.log(allprice)
      this.setData({
        allGoodsPrice: allprice,

      });

    }

  },
  //点击物流信息
  wuliuDetailsTap: function(e) {
    var orderId = e.currentTarget.dataset.id;
    //跳转到物流页面
    wx.navigateTo({
      url: "/pages/wuliu/index?id=" + orderId
    })
  },
  //点击确认收货
  confirmBtnTap: function(e) {
    // let that = this;
    // let orderId = this.data.orderId;
    // let formId = e.detail.formId;
    // wx.showModal({
    //   title: '确认您已收到商品？',
    //   content: '',
    //   success: function(res) {
    //     if (res.confirm) {
    //       wx.showLoading();
    //       wx.request({
    //         //确认收货
    //         url: 'https://api.it120.cc/' + app.globalData.subDomain + '/order/delivery',
    //         method: 'PUT',
    //         data: {
    //           userID: this.data.shippingData.userID,
    //           logistcsId: this.data.shippingData.logistcsId,
    //           shippingId: this.data.shippingData.shippingId,
    //           orderAmount: this.data.allprice + this.data.yunPrice,
    //           moneyPaid: this.data.allprice + this.data.yunPrice,
    //           confirmTime: new Date().getTime(),
    //           orderStatus: 0

    //         },
    //         success: (res) => {
    //           if (res.data.code == 0) {
    //             that.onShow();
    //             // 模板消息，提醒用户进行评价
    //             let postJsonString = {};
    //             postJsonString.keyword1 = {
    //               value: that.data.orderDetail.orderInfo.orderNumber,
    //               color: '#173177'
    //             }
    //             let keywords2 = '您已确认收货，期待您的再次光临！';
    //             if (app.globalData.order_reputation_score) {
    //               keywords2 += '立即好评，系统赠送您' + app.globalData.order_reputation_score + '积分奖励。';
    //             }
    //             postJsonString.keyword2 = {
    //               value: keywords2,
    //               color: '#173177'
    //             }
    //             //给用户发送信息
    //             app.sendTempleMsgImmediately('uJL7D8ZWZfO29Blfq34YbuKitusY6QXxJHMuhQm_lco', formId,
    //               '/pages/order-details/index?id=' + orderId, JSON.stringify(postJsonString));
    //           }
    //         }
    //       })
    //     }
    //   }
    // })
  },
  //点击提交评价
  // submitReputation: function(e) {
  //   let that = this;
  //   let formId = e.detail.formId;
  //   let postJsonString = {};
  //   postJsonString.token = wx.getStorageSync('token');
  //   postJsonString.orderId = this.data.orderId;
  //   //创建评论的数据数组
  //   let reputations = [];
  //   let i = 0;
  //   while (e.detail.value["orderGoodsId" + i]) {
  //     let orderGoodsId = e.detail.value["orderGoodsId" + i];
  //     let goodReputation = e.detail.value["goodReputation" + i];
  //     let goodReputationRemark = e.detail.value["goodReputationRemark" + i];

  //     let reputations_json = {};
  //     reputations_json.id = orderGoodsId;
  //     reputations_json.reputation = goodReputation;
  //     reputations_json.remark = goodReputationRemark;

  //     reputations.push(reputations_json);
  //     i++;
  //   }
  //   postJsonString.reputations = reputations;
  //   wx.showLoading();
  //   wx.request({
  //     //发送评价
  //     url: 'https://api.it120.cc/' + app.globalData.subDomain + '/order/reputation',
  //     data: {
  //       postJsonString: postJsonString
  //     },
  //     success: (res) => {
  //       wx.hideLoading();
  //       if (res.data.code == 0) {
  //         that.onShow();
  //         // 模板消息，通知用户已评价
  //         let postJsonString = {};
  //         postJsonString.keyword1 = {
  //           value: that.data.orderDetail.orderInfo.orderNumber,
  //           color: '#173177'
  //         }
  //         let keywords2 = '感谢您的评价，期待您的再次光临！';
  //         if (app.globalData.order_reputation_score) {
  //           keywords2 += app.globalData.order_reputation_score + '积分奖励已发放至您的账户。';
  //         }
  //         postJsonString.keyword2 = {
  //           value: keywords2,
  //           color: '#173177'
  //         }
  //         app.sendTempleMsgImmediately('uJL7D8ZWZfO29Blfq34YbuKitusY6QXxJHMuhQm_lco', formId,
  //           '/pages/order-details/index?id=' + that.data.orderId, JSON.stringify(postJsonString));
  //       }
  //     }
  //   })
  // }
})