//index.js
var app = getApp()
Page({
  data: {
    goodsList: {
      saveHidden: true,
      totalPrice: 0,
      totalScoreToPay: 0,
      allSelect: true,
      noSelect: false,
      list: []
    },
    delBtnWidth: 120, //删除按钮宽度单位（rpx）
  },

  //获取元素自适应后的实际宽度
  getEleWidth: function(w) {
    var real = 0;
    try {
      var res = wx.getSystemInfoSync().windowWidth;
      var scale = (750 / 2) / (w / 2); //以宽度750px设计稿做宽度的自适应
      // console.log(scale);
      real = Math.floor(res / scale);
      return real;
    } catch (e) {
      return false;
      // Do something when catch error
    }
  },
  //按钮宽度赋值
  initEleWidth: function() {
    var delBtnWidth = this.getEleWidth(this.data.delBtnWidth);
    this.setData({
      delBtnWidth: delBtnWidth
    });
  },
  onLoad: function() {
    this.initEleWidth();
    this.onShow();
  },
  onShow: function() {
    var shopList = [];
    // 获取购物车数据
    var shopCarInfoMem = wx.getStorageSync('shopCarInfo');
    if (shopCarInfoMem && shopCarInfoMem.shopList) {
      shopList = shopCarInfoMem.shopList
    }
    this.data.goodsList.list = shopList;
    //编辑结算购物车的信息
    this.setGoodsList(this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), shopList);
  },
  //点击去逛逛
  toIndexPage: function() {
    wx.switchTab({
      url: "/pages/index/index"
    });
  },
  //点击选中订单开始touchstart
  touchS: function(e) {
    // console.log(e)
    if (e.touches.length == 1) {
      this.setData({
        startX: e.touches[0].clientX
      });
    }
  },
  //按住订单滑动，订单根据用户手指移动touchmove
  touchM: function(e) {
    // console.log(e)
    var index = e.currentTarget.dataset.index;

    if (e.touches.length == 1) {
      var moveX = e.touches[0].clientX;
      var disX = this.data.startX - moveX;
      var delBtnWidth = this.data.delBtnWidth;
      var left = "";
      if (disX == 0 || disX < 0) { //如果移动距离小于等于0，container位置不变
        left = "margin-left:0px";
      } else if (disX > 0) { //移动距离大于0，container left值等于手指移动距离
        left = "margin-left:-" + disX + "px";
        if (disX >= delBtnWidth) {
          left = "left:-" + delBtnWidth + "px";
        }
      }
      var list = this.data.goodsList.list;
      if (index != "" && index != null) {
        list[parseInt(index)].left = left;
        this.setGoodsList(this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list);
      }
    }
  },
  //按住订单左滑结束判断，是否展示删除按钮touchend
  touchE: function(e) {
    // console.log(e)
    var index = e.currentTarget.dataset.index;
    if (e.changedTouches.length == 1) {
      var endX = e.changedTouches[0].clientX;
      var disX = this.data.startX - endX;
      var delBtnWidth = this.data.delBtnWidth;
      //如果距离小于删除按钮的1/2，不显示删除按钮
      var left = disX > delBtnWidth / 2 ? "margin-left:-" + delBtnWidth + "px" : "margin-left:0px";
      var list = this.data.goodsList.list;
      if (index !== "" && index != null) {
        list[parseInt(index)].left = left;
        this.setGoodsList(this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list);

      }
    }
  },
  //删除项目
  delItem: function(e) {
    var index = e.currentTarget.dataset.index;
    var list = this.data.goodsList.list;
    list.splice(index, 1);
    //重新编辑结算的购物车信息
    this.setGoodsList(this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list);
  },
  //点击订单勾选框后事件
  selectTap: function(e) {
    var index = e.currentTarget.dataset.index;
    var list = this.data.goodsList.list;
    if (index !== "" && index != null) {
      list[parseInt(index)].active = !list[parseInt(index)].active;
      this.setGoodsList(this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list);
    }
    // console.log(list)
  },
  //计算总价
  totalPrice: function() {
    var list = this.data.goodsList.list;
    var total = 0;
    let totalScoreToPay = 0;
    for (var i = 0; i < list.length; i++) {
      var curItem = list[i];
      if (curItem.active) {
        total += parseFloat(curItem.price) * curItem.number;
        totalScoreToPay += curItem.score * curItem.number;
      }
    }
    this.data.goodsList.totalScoreToPay = totalScoreToPay;
    total = parseFloat(total.toFixed(2)); //js浮点计算bug，取两位小数精度
    return total;
  },
  //全选
  allSelect: function() {
    var list = this.data.goodsList.list;
    var allSelect = false;
    for (var i = 0; i < list.length; i++) {
      var curItem = list[i];
      if (curItem.active) {
        allSelect = true;
      } else {
        allSelect = false;
        break;
      }
    }
    return allSelect;
  },
  //全不选
  noSelect: function() {
    var list = this.data.goodsList.list;
    var noSelect = 0;
    for (var i = 0; i < list.length; i++) {
      var curItem = list[i];
      if (!curItem.active) {
        noSelect++;
      }
    }
    if (noSelect == list.length) {
      return true;
    } else {
      return false;
    }
  },
  //设置结算的购物车信息
  setGoodsList: function(saveHidden, total, allSelect, noSelect, list) {
    this.setData({
      goodsList: {
        saveHidden: saveHidden,
        totalPrice: total,
        allSelect: allSelect,
        noSelect: noSelect,
        list: list,
        totalScoreToPay: this.data.goodsList.totalScoreToPay
      }
    });
    var shopCarInfo = {};
    var tempNumber = 0;
    shopCarInfo.shopList = list;
    for (var i = 0; i < list.length; i++) {
      tempNumber = tempNumber + list[i].number
    }
    shopCarInfo.shopNum = tempNumber;
    wx.setStorage({
      key: "shopCarInfo",
      data: shopCarInfo
    })
  },
  //点击全选勾选框
  bindAllSelect: function() {
    var currentAllSelect = this.data.goodsList.allSelect;
    var list = this.data.goodsList.list;
    if (currentAllSelect) {
      for (var i = 0; i < list.length; i++) {
        var curItem = list[i];
        curItem.active = false;
      }
    } else {
      for (var i = 0; i < list.length; i++) {
        var curItem = list[i];
        curItem.active = true;
      }
    }

    this.setGoodsList(this.getSaveHide(), this.totalPrice(), !currentAllSelect, this.noSelect(), list);
  },
  //点击加号按钮
  jiaBtnTap: function(e) {
    var that = this
    var index = e.currentTarget.dataset.index;
    var list = that.data.goodsList.list;
    if (index !== "" && index != null) {
      // 添加判断当前商品购买数量是否超过当前商品可购买库存
      var carShopBean = list[parseInt(index)];
      var carShopBeanStores = 0;
      wx.request({
        //获取商品详情
        url: 'https://api.it120.cc/' + app.globalData.subDomain + '/shop/goods/detail',
        data: {
          id: carShopBean.goodsId
        },
        success: function(res) {
          carShopBeanStores = res.data.data.basicInfo.stores;
          // console.log(' currnet good id and stores is :', carShopBean.goodsId, carShopBeanStores)
          //如果库存够则++
          if (list[parseInt(index)].number < carShopBeanStores) {
            list[parseInt(index)].number++;
            that.setGoodsList(that.getSaveHide(), that.totalPrice(), that.allSelect(), that.noSelect(), list);
          }
          that.setData({
            curTouchGoodStore: carShopBeanStores
          })
        }
      })
    }
  },
  //点击减号按钮
  jianBtnTap: function(e) {
    var index = e.currentTarget.dataset.index;
    var list = this.data.goodsList.list;
    if (index !== "" && index != null) {
      //判断小于1则无法--
      if (list[parseInt(index)].number > 1) {
        list[parseInt(index)].number--;
        this.setGoodsList(this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list);
      }
    }
  },
  //点击编辑按钮
  editTap: function() {
    var list = this.data.goodsList.list;
    for (var i = 0; i < list.length; i++) {
      var curItem = list[i];
      curItem.active = false;
    }
    this.setGoodsList(!this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list);
  },
  //点击完成按钮
  saveTap: function() {
    var list = this.data.goodsList.list;
    for (var i = 0; i < list.length; i++) {
      var curItem = list[i];
      curItem.active = true;
    }
    this.setGoodsList(!this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list);
  },
  //编辑完成按钮的显示隐藏
  getSaveHide: function() {
    var saveHidden = this.data.goodsList.saveHidden;
    return saveHidden;
  },
  //点击编辑后的显示的删除按钮
  deleteSelected: function() {
    var list = this.data.goodsList.list;
    /*
     for(let i = 0 ; i < list.length ; i++){
           let curItem = list[i];
           if(curItem.active){
             list.splice(i,1);
           }
     }
     */
    // above codes that remove elements in a for statement may change the length of list dynamically
    //数组过滤筛选
    list = list.filter(function(curGoods) {
      return !curGoods.active;
    });
    this.setGoodsList(this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list);
  },
  //点击去结算
  toPayOrder: function() {
    wx.showLoading();
    var that = this;
    //选择了全不选不展示
    if (this.data.goodsList.noSelect) {
      wx.hideLoading();
      return;
    }
    // 重新计算价格，判断库存
    var shopList = [];
    var shopCarInfoMem = wx.getStorageSync('shopCarInfo');
    if (shopCarInfoMem && shopCarInfoMem.shopList) {
      // shopList = shopCarInfoMem.shopList
      shopList = shopCarInfoMem.shopList.filter(entity => {
        return entity.active;
      });
    }
    //商品数组长度为零不展示
    if (shopList.length == 0) {
      wx.hideLoading();
      return;
    }
    var isFail = false;
    var doneNumber = 0;
    var needDoneNUmber = shopList.length;
    for (let i = 0; i < shopList.length; i++) {
      if (isFail) {
        wx.hideLoading();
        return;
      }
      let carShopBean = shopList[i];
      // 获取价格和库存
      console.log(shopList[i])
      //对选择的规格尺寸信息是否存在判断
      if (!carShopBean.propertyChildIds || carShopBean.propertyChildIds == "") {
        wx.request({
          url: 'https://api.it120.cc/' + app.globalData.subDomain + '/shop/goods/detail',
          data: {
            id: carShopBean.goodsId
          },
          success: function(res) {
            doneNumber++;
            if (res.data.data.properties) {
              wx.showModal({
                title: '提示',
                content: res.data.data.basicInfo.name + ' 商品已失效，请重新购买',
                showCancel: false
              })
              isFail = true;
              wx.hideLoading();
              return;
            }
            if (res.data.data.basicInfo.stores < carShopBean.number) {
              wx.showModal({
                title: '提示',
                content: res.data.data.basicInfo.name + ' 库存不足，请重新购买',
                showCancel: false
              })
              isFail = true;
              wx.hideLoading();
              return;
            }
            if (res.data.data.basicInfo.minPrice != carShopBean.price) {
              wx.showModal({
                title: '提示',
                content: res.data.data.basicInfo.name + ' 价格有调整，请重新购买',
                showCancel: false
              })
              isFail = true;
              wx.hideLoading();
              return;
            }
            if (needDoneNUmber == doneNumber) {
              that.navigateToPayOrder();
            }
          }
        })
      } else {
        wx.request({
          url: 'https://api.it120.cc/' + app.globalData.subDomain + '/shop/goods/price',
          data: {
            goodsId: carShopBean.goodsId,
            propertyChildIds: carShopBean.propertyChildIds
          },
          success: function(res) {
            doneNumber++;
            if (res.data.data.stores < carShopBean.number) {
              wx.showModal({
                title: '提示',
                content: carShopBean.name + ' 库存不足，请重新购买',
                showCancel: false
              })
              isFail = true;
              wx.hideLoading();
              return;
            }
            if (res.data.data.price != carShopBean.price) {
              wx.showModal({
                title: '提示',
                content: carShopBean.name + ' 价格有调整，请重新购买',
                showCancel: false
              })
              isFail = true;
              wx.hideLoading();
              return;
            }
            if (needDoneNUmber == doneNumber) {
              that.navigateToPayOrder();
            }
          }
        })
      }

    }
  },
  //跳转套支付页面
  navigateToPayOrder: function() {
    wx.hideLoading();
    wx.navigateTo({
      url: "/pages/to-pay-order/index"
    })
  }



})