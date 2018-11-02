//index.js
//获取应用实例
var app = getApp()
//todo提交订单同时，删除购物车
Page({
  data: {
    totalScoreToPay: 0,
    goodsList: [],
    isNeedLogistics: 0, // 是否需要物流信息
    allGoodsPrice: 0,
    yunPrice: 0,
    allGoodsAndYunPrice: 0,
    goodsJsonStr: "",
    orderType: "", //订单类型，购物车下单或立即支付下单，默认是购物车，
    pingtuanOpenId: undefined, //拼团的话记录团号
    hasNoCoupons: true,
    coupons: [],
    youhuijine: 0, //优惠券金额
    curCoupon: null // 当前选择使用的优惠券
  },
  onShow: function() {
    var that = this;
    var shopList = [];
    //立即购买下单
    if ("buyNow" == that.data.orderType) {
      var buyNowInfoMem = wx.getStorageSync('buyNowInfo');
      console.log(buyNowInfoMem)
      this.setData({
        shoptotalPriceNum: buyNowInfoMem.shoptotalPriceNum
      })
      // that.data.kjId = buyNowInfoMem.kjId;
      if (buyNowInfoMem && buyNowInfoMem.shopList) {
        shopList = buyNowInfoMem.shopList
      }
      that.setData({
        goodsList: shopList,
      });
    } else {
      //购物车下单
      var shopCarInfoMem = wx.getStorageSync('shopCarInfo');
      
      this.setData({
        shoptotalPriceNum: shopCarInfoMem.shoptotalPriceNum
      })
      // that.data.kjId = shopCarInfoMem.kjId;
      for (var i = 0; i < shopCarInfoMem.shopList.length; i++) {
        shopCarInfoMem.shopList[i].label = shopCarInfoMem.shopList[i].sku.normData

      }

      if (shopCarInfoMem && shopCarInfoMem.shopList) {
        shopList = shopCarInfoMem.shopList
      }
    }
    that.setData({
      goodsList: shopList,
    });
    console.log(that.data.goodsList)
    //获取用户默认地址
    that.initShippingAddress();
  },

  onLoad: function(e) {
    this.setData({
      isNeedLogistics: 1,
      orderType: e.orderType,
    });
  },
  //创建订单
  createOrder: function(e) {
    wx.showLoading();
    var that = this;
    // var loginToken = wx.getStorageSync('token') // 用户登录 token
    var remark = ""; // 备注信息
    if (e) {
      remark = e.detail.value.remark; // 备注信息
    }

    var postData = {};
    // //是否有砍价
    // if (that.data.kjId) {
    //   postData.kjid = that.data.kjId
    // }
    // //是否有拼团
    // if (that.data.pingtuanOpenId) {
    //   postData.pingtuanOpenId = that.data.pingtuanOpenId
    // }
    //是否需要物流信息

    //判断地址是否为空
    if (!that.data.curAddressData) {
      wx.hideLoading();
      wx.showModal({
        title: '错误',
        content: '请先设置您的收货地址！',
        showCancel: false
      })
      return;
    }
    //设置订单所需信息


    postData.userID = wx.getStorageSync('user').id
    postData.shippingId = that.data.shippingId || 1
    postData.logistcsId = 0
    postData.orderAmount = that.data.shoptotalPriceNum
    postData.moneyPaid = 0

    var time = new Date()
    var mm = new Date().getMonth() + 1 < 10 ? '0'+(new Date().getMonth() + 1): new Date().getMonth() + 1
    var dd = new Date().getDate() < 10 ? '0' + (new Date().getDate()) : new Date().getDate()
    var hh = new Date().getHours() < 10 ? '0' + (new Date().getHours()) : new Date().getHours()
    var mm1 = new Date().getMinutes() < 10 ? '0' + (new Date().getMinutes()) : new Date().getMinutes()
    var ss = new Date().getSeconds() < 10 ? '0' + (new Date().getSeconds()) : new Date().getSeconds()
    time = new Date().getFullYear() + '-' + mm + '-' + dd + 'T' +hh + ':' + mm1 + ':' + ss +'+08:00'
    postData.confirmTime = time

    postData.orderStatus = 1
    postData.pics = []
    
    for(var i=0;i<this.data.goodsList.length;i++){
      postData.pics.push(this.data.goodsList[i].product.pics[0])
    }
    postData.addressId = this.data.curAddressData.id
    


    // if (that.data.curCoupon) {
    //   postData.couponId = that.data.curCoupon.id;
    // }
    if (!e) {
      postData.calculate = "true";
    }

    //发送创建订单请求
    wx.request({
      // 创建订单
      url: 'http://47.99.112.182:4030/v1/order/',
      method: 'POST',
      data: postData, // 设置请求的 参数
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
        for (var i = 0; i < that.data.goodsList.length;i++){
          //创建订单商品信息
          wx.request({
            url: 'http://47.99.112.182:4030/v1/orderrec/',
            method: 'POST',
            data: {
              orderId: res.data.data.id,
              productId: that.data.goodsList[i].product.id,
              skuId: that.data.goodsList[i].sku.id,
              name: that.data.goodsList[i].product.name,
              normInfo: that.data.goodsList[i].sku.normInfo,
              price: that.data.goodsList[i].sku.price,
              count: that.data.goodsList[i].number,
            }, // 设置请求的 参数
            success: (res) => {
              console.log(res.data)
            }
          })
          //删除购物车的相关信息
          wx.request({
            url: 'http://47.99.112.182:4030/v1/cart/' + that.data.goodsList[i].id,
            method:'DELETE',
            success: (res)=>{
              console.log(res.data)
            }

          })
        }
        
        //创建完成订单后，清空购物车数据
        if ("buyNow" != that.data.orderType) {
          console.log(1111123121)
          // 清空购物车数据
          wx.removeStorageSync('shopCarInfo');
        }
        //e
        if (!e) {
          that.setData({
            totalScoreToPay: res.data.data.score,
            isNeedLogistics: res.data.data.isNeedLogistics,
            allGoodsPrice: res.data.data.amountTotle,
            allGoodsAndYunPrice: res.data.data.amountLogistics + res.data.data.amountTotle,
            yunPrice: res.data.data.amountLogistics
          });
          //获取我的优惠劵
          // that.getMyCoupons();
          return;
        }
        // 配置模板消息推送
        // var postJsonString = {};
        // postJsonString.keyword1 = {
        //   value: res.data.data.dateAdd,
        //   color: '#173177'
        // }
        // postJsonString.keyword2 = {
        //   value: res.data.data.amountReal + '元',
        //   color: '#173177'
        // }
        // postJsonString.keyword3 = {
        //   value: res.data.data.orderNumber,
        //   color: '#173177'
        // }
        // postJsonString.keyword4 = {
        //   value: '订单已关闭',
        //   color: '#173177'
        // }
        // postJsonString.keyword5 = {
        //   value: '您可以重新下单，请在30分钟内完成支付',
        //   color: '#173177'
        // }
        // app.sendTempleMsg(res.data.data.id, -1,
        //   'mGVFc31MYNMoR9Z-A9yeVVYLIVGphUVcK2-S2UdZHmg', e.detail.formId,
        //   'pages/index/index', JSON.stringify(postJsonString));
        // postJsonString = {};
        // postJsonString.keyword1 = {
        //   value: '您的订单已发货，请注意查收',
        //   color: '#173177'
        // }
        // postJsonString.keyword2 = {
        //   value: res.data.data.orderNumber,
        //   color: '#173177'
        // }
        // postJsonString.keyword3 = {
        //   value: res.data.data.dateAdd,
        //   color: '#173177'
        // }
        // app.sendTempleMsg(res.data.data.id, 2,
        //   'Arm2aS1rsklRuJSrfz-QVoyUzLVmU2vEMn_HgMxuegw', e.detail.formId,
        //   'pages/order-details/index?id=' + res.data.data.id, JSON.stringify(postJsonString));
        // 下单成功，跳转到订单管理界面
        wx.redirectTo({
          url: "/pages/order-list/index"
        });
      }
    })
   
  },
  //初始化购物地址
  initShippingAddress: function() {
    var that = this;
    wx.request({
      //获取用户默认地址   /address/:id
      url: 'http://47.99.112.182:4030/v1/user/' + wx.getStorageSync('user').id,
      success: (res) => {
        if (res.data.code == 0) {
          wx.request({
            //获取用户默认地址   /address/:id
            url: 'http://47.99.112.182:4030/v1/address/' + res.data.data.defaultAddressId,
            success: (res) => {
              if (res.data.code == 0) {
                that.setData({
                  curAddressData: res.data.data
                });
              } else {
                that.setData({
                  curAddressData: null
                });
              }
              //运费处理
              // that.processYunfei();
            }
          })
        } 
        //运费处理
        // that.processYunfei();
      }
    })
    
  },
  //运费处理
  // processYunfei: function() {
  //   var that = this;
  //   var goodsList = this.data.goodsList;
  //   var goodsJsonStr = "[";
  //   var isNeedLogistics = 0;
  //   var allGoodsPrice = 0;

  //   for (let i = 0; i < goodsList.length; i++) {
  //     let carShopBean = goodsList[i];
  //     if (carShopBean.logistics) {
  //       isNeedLogistics = 1;
  //     }
  //     allGoodsPrice += carShopBean.price * carShopBean.number;

  //     var goodsJsonStrTmp = '';
  //     if (i > 0) {
  //       goodsJsonStrTmp = ",";
  //     }


  //     let inviter_id = 0;
  //     let inviter_id_storge = wx.getStorageSync('inviter_id_' + carShopBean.goodsId);
  //     if (inviter_id_storge) {
  //       inviter_id = inviter_id_storge;
  //     }

  //     //生成商品json
  //     goodsJsonStrTmp += '{"goodsId":' + carShopBean.goodsId + ',"number":' + carShopBean.number + ',"propertyChildIds":"' + carShopBean.propertyChildIds + '","logisticsType":0, "inviter_id":' + inviter_id + '}';
  //     goodsJsonStr += goodsJsonStrTmp;


  //   }
  //   goodsJsonStr += "]";
  //   //console.log(goodsJsonStr);
  //   that.setData({
  //     isNeedLogistics: isNeedLogistics,
  //     goodsJsonStr: goodsJsonStr
  //   });
  //   that.createOrder();
  // },
  //点击添加地址
  addAddress: function() {
    wx.navigateTo({
      url: "/pages/address-add/index"
    })
  },
  //点击地址
  selectAddress: function() {
    wx.navigateTo({
      url: "/pages/select-address/index"
    })
  },
  //获取我的优惠劵
  // getMyCoupons: function() {
  //   var that = this;
  //   wx.request({
  //     //获取我的优惠劵
  //     url: 'https://api.it120.cc/' + app.globalData.subDomain + '/discounts/my',
  //     data: {
  //       token: wx.getStorageSync('token'),
  //       status: 0
  //     },
  //     success: function(res) {
  //       if (res.data.code == 0) {
  //         var coupons = res.data.data.filter(entity => {
  //           return entity.moneyHreshold <= that.data.allGoodsAndYunPrice;
  //         });
  //         if (coupons.length > 0) {
  //           that.setData({
  //             hasNoCoupons: false,
  //             coupons: coupons
  //           });
  //         }
  //       }
  //     }
  //   })
  // },
  //选择优惠劵
  // bindChangeCoupon: function(e) {
  //   const selIndex = e.detail.value[0] - 1;
  //   if (selIndex == -1) {
  //     this.setData({
  //       youhuijine: 0,
  //       curCoupon: null
  //     });
  //     return;
  //   }
  //   //console.log("selIndex:" + selIndex);
  //   this.setData({
  //     youhuijine: this.data.coupons[selIndex].money,
  //     curCoupon: this.data.coupons[selIndex]
  //   });
  // }
})