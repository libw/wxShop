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
    newList :[],
    newShopList:[],
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
    wx.showLoading({"mask": true})
    this.initEleWidth();
    // this.onShow();
  },
  onShow: function() {
    
    let that=this
    var shopList = [];
    // 获取购物车数据  /cart/query
    wx.request({
      url: 'http://47.99.112.182:4030/v1/' + 'cart/query',
      method:"POST",
      data: {
        userId: wx.getStorageSync('user').id
      },
      success: function(res) {
        wx.hideLoading()
        if (res.data.code == 0) {
          that.setData({
            newShopList : res.data.data
          }) 
        }
        
        if (that.data.newShopList&&that.data.newShopList.length > 0) {

          that.data.goodsList.list = that.data.newShopList;
          for (var i = 0; i < that.data.goodsList.list.length; i++) {
            var normData = ''
            for (var j = 0; j < that.data.goodsList.list[i].sku.normInfo.length; j++) {
              normData = normData + that.data.goodsList.list[i].sku.normInfo[j] + ' '
            }
            that.data.goodsList.list[i].sku.normData = normData
          }
          wx.setStorageSync('shopCarInfo', that.data.goodsList.list)
          //编辑结算购物车的信息
          that.setGoodsList(that.getSaveHide(), that.totalPrice(), that.allSelect(), that.noSelect(), that.data.goodsList.list);
        } else if (!that.data.newShopList){
          that.setGoodsList(that.getSaveHide(), that.totalPrice(), that.allSelect(), that.noSelect(), []);
        }
      }
    })
    // var shopCarInfoMem = wx.getStorageSync('shopCarInfo');
    // if (shopCarInfoMem && shopCarInfoMem.shopList) {
    //   shopList = shopCarInfoMem.shopList
    // }
    
   
    
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
    删除购物车项目
    wx.request({
      //获取商品库存详情
      url: 'http://47.99.112.182:4030/v1/' + 'cart/' + list[index].id,
      method: 'DELETE',
      data: {
        // id: list[index].id
      },
      success: function(res) {

      },
    })
    //重新编辑结算的购物车信息
    this.setGoodsList(this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list);
    this.onShow()
  },
  //点击订单勾选框后事件
  selectTap: function(e) {
    var index = e.currentTarget.dataset.index;
    var list = this.data.goodsList.list;
    if (index !== "" && index != null) {
      list[parseInt(index)].active = !list[parseInt(index)].active;
      let newList=[]
      list.forEach(function (value) {
        if (value.active == true){
          newList.push(value)
        }
         ;
      })
      this.setData({
        newList: newList
      })
      // console.log(newList)
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
        total += parseFloat(curItem.product.shopPrice) * curItem.number;
        // totalScoreToPay += curItem.score * curItem.number;
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
    shopCarInfo.shopList = this.data.newList;
    for (var i = 0; i < list.length; i++) {
      tempNumber = tempNumber + list[i].number
    }
    shopCarInfo.shoptotalPriceNum = total;
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
      var carShopBeanStores = 5;

      if (list[parseInt(index)].number < carShopBeanStores) {
        list[parseInt(index)].number++;
        that.setGoodsList(that.getSaveHide(), that.totalPrice(), that.allSelect(), that.noSelect(), list);
      }
      that.setData({
        curTouchGoodStore: carShopBeanStores
      })

      wx.request({
        //获取商品库存详情
        url: 'https://api.it120.cc/' + app.globalData.subDomain + '/shop/goods/detail',
        data: {
          id: carShopBean.sku.id
        },
        success: function(res) {
          carShopBeanStores = res.data.data.inStockCount;
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
    var deteleIds = [];
    list = list.filter(function(curGoods) {
      if (curGoods.active) {
        deteleIds.push(curGoods.id)
      }
      return !curGoods.active;
    });
    deteleIds.forEach((v, i) => {
      console.log(v)
      wx.request({ 
        url: 'http://47.99.112.182:4030/v1/cart/' + v,
        method: 'DELETE',
        data: {
          id: v
        },
        success: function(res) {

        },
      })
    })

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
      //对选择的规格尺寸信息是否存在判断
      wx.request({
        //获取商品库存详情
        url: 'http://47.99.112.182:4030/v1/sku/' + shopList[i].sku.id,
        success: function (res) {
          if (!res.data.data.id) {
            wx.showModal({
              title: '提示',
              content: carShopBean.product.name + ' 商品已失效，请重新购买',
              showCancel: false
            })
            isFail = true;
            wx.hideLoading();
            return;
          }
          if (carShopBean.sku.inStockCount > res.data.data.inStockCount) {
            wx.showModal({
              title: '提示',
              content: carShopBean.product.name + ' 库存不足，请重新购买',
              showCancel: false
            })
            isFail = true;
            wx.hideLoading();
            return;
          }
          if (carShopBean.product.shopPrice != res.data.data.price) {
            wx.showModal({
              title: '提示',
              content: carShopBean.product.name + ' 价格有调整，请重新购买',
              showCancel: false
            })
            isFail = true;
            wx.hideLoading();
            return;
          }
          
            that.navigateToPayOrder();
          
        }})
      
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