//index.js
//获取应用实例
var app = getApp();
var WxParse = require('../../wxParse/wxParse.js');
Page({
  data: {
    autoplay: true,
    interval: 3000,
    duration: 1000,
    goodsDetail: {},
    swiperCurrent: 0,
    hasMoreSelect: false,
    selectSize: "选择：",
    selectSizePrice: 0,
    totalScoreToPay: 0,
    shopNum: 0,
    hideShopPopup: true,
    buyNumber: 0,
    buyNumMin: 0,
    buyNumMax: 0,


    propertyChildIds: "",
    propertyChildNames: "",
    canJia: false, //可以点击加号按钮
    canSubmit: false, //  选中规格尺寸时候是否允许加入购物车
    shopCarInfo: {},
    shopType: "addShopCar", //购物类型，加入购物车或立即购买，默认为加入购物车
  },

  //事件处理函数
  swiperchange: function(e) {
    // console.log(e.detail.current)
    this.setData({
      swiperCurrent: e.detail.current
    })
  },
  onLoad: function(e) {
    console.log(e.id)
    if (e.inviter_id) {
      wx.setStorage({
        key: 'inviter_id_' + e.id,
        data: e.inviter_id
      })
    }
    this.cartNumber() 
    var that = this;
    // that.data.kjId = e.kjId;
    // 获取购物车数据
    wx.getStorage({
      key: 'shopCarInfo',
      success: function(res) {
        that.setData({
          shopCarInfo: res.data,
          shopNum: res.data.shopNum
        });
      }
    })
    wx.request({
      //TODO 获取商品详情页数据
      url: 'http://47.99.112.182:4030/v1/' + 'product/' + e.id,
      success: function(res) {
        that.setData({
          goodsDetail: res.data.data,
          selectSizePrice: res.data.data.shopPrice,

        });
        if (res.data.data.normIds) {
          let normsArray = []
          let oldNormsArray = res.data.data.normIds
          for (let i = 0; i < res.data.data.normIds.length; i++) {
            wx.request({
              // 获取商品规格信息
              url: 'http://47.99.112.182:4030/v1/' + 'norm/' + res.data.data.normIds[i],
              success: function(res) {
                normsArray.push(res.data.data)
                if (oldNormsArray.length == normsArray.length) {
                  var newNorms = []

                  for (var i = 0; i < normsArray.length; i++) {
                    console.log(1)
                    var newNormsChild = {}
                    newNormsChild.name = normsArray[i].name;
                    let childsContent = []

                    for (var j = 0; j < normsArray[i].options.length; j++) {
                      let childsChild = {}
                      childsChild.name = normsArray[i].options[j];
                      childsChild.active = false;
                      childsContent.push(childsChild)
                    }
                    // console.log(childsChild)
                    newNormsChild.options = []
                    newNormsChild.options.push(childsContent)
                    // console.log(newNormsChild)
                    newNorms.push(newNormsChild)

                  }
                  that.setData({
                    newNorms: newNorms
                  })
                  console.log(newNorms)
                  var selectSizeTemp = "";
                  if (newNorms) {
                    for (var i = 0; i < newNorms.length; i++) {
                      selectSizeTemp = selectSizeTemp + " " + newNorms[i].name;
                    }
                    that.setData({
                      hasMoreSelect: true,
                      selectSize: that.data.selectSize + selectSizeTemp,

                    });

                  } else {
                    selectSizeTemp = '均码'
                  }
                }
              }
            })
          }
        } else {

        }



        // console.log(that.data.goodsDetail)
        //如果可以拼团，获取拼团列表数据
        // if (res.data.data.basicInfo.pingtuan) {
        //   that.pingtuanList(e.id)
        // }

        that.data.goodsDetail = res.data.data;
        //如果有视频文件，获取视频文件
        // if (res.data.data.basicInfo.videoId) {
        //   that.getVideoSrc(res.data.data.basicInfo.videoId);
        // }

        console.log(that.data.goodsDetail)
        //将html格式的编译
        // WxParse.wxParse('article', 'html', res.data.data.content, that, 5);
      }
    })
    //获取商品评论列表
    // this.reputation(e.id);
    //获取商品砍价信息
    // this.getKanjiaInfo(e.id);
  },
  //跳转到购物车页面
  goShopCar: function() {
    wx.reLaunch({
      url: "/pages/shop-cart/index"
    });
  },
  //点击加入购物车
  toAddShopCar: function() {
    this.setData({
      shopType: "addShopCar"
    })
    //弹出购物车数量输入框
    this.bindGuiGeTap();
  },
  //点击立即购买
  tobuy: function() {
    this.setData({
      shopType: "tobuy",
      selectSizePrice: this.data.goodsDetail.shopPrice
    });
    this.bindGuiGeTap();
  },
  //点击去拼团
  // toPingtuan: function() {
  //   this.setData({
  //     shopType: "toPingtuan",
  //     selectSizePrice: this.data.goodsDetail.basicInfo.pingtuanPrice
  //   });
  //   this.bindGuiGeTap();
  // },
  /**
   * 规格选择弹出框
   */
  bindGuiGeTap: function() {
    this.setData({
      hideShopPopup: false
    })
  },
  /**
   * 规格选择弹出框隐藏
   */
  closePopupTap: function() {
    this.setData({
      hideShopPopup: true
    })
  },
  //点击减号
  numJianTap: function() {
    if (this.data.buyNumber > this.data.buyNumMin) {
      var currentNum = this.data.buyNumber;
      currentNum--;
      this.setData({
        buyNumber: currentNum
      })
    }
  },
  //点击加号
  numJiaTap: function() {
    // console.log(1, this.data.buyNumMax)
    if (this.data.canJia) {
      if (this.data.buyNumber < this.data.buyNumMax) {
        var currentNum = this.data.buyNumber;
        currentNum++;
        this.setData({
          buyNumber: currentNum
        })
      }
    } else {
      wx.showModal({
        title: '提示',
        content: '请选择商品规格！',
        showCancel: false
      })
    }

  },
  /**
   * 选择商品规格
   * @param {Object} e
   */
  labelItemTap: function(e) {
    var that = this;
    /*
    
    console.log(e.currentTarget.dataset.propertyid)
    console.log(e.currentTarget.dataset.propertyname)
    console.log(e.currentTarget.dataset.propertychildid)
    console.log(e.currentTarget.dataset.propertychildname)
    */
    // 取消该分类下的子栏目所有的选中状态

    var childs = that.data.newNorms[e.currentTarget.dataset.propertyindex].options[0];

    for (var i = 0; i < childs.length; i++) {
      that.data.newNorms[e.currentTarget.dataset.propertyindex].options[0][i].active = false;
    }
    // 设置当前选中状态

    that.data.newNorms[e.currentTarget.dataset.propertyindex].options[0][e.currentTarget.dataset.propertychildindex].active = true;
    console.log(2, that.data.newNorms)
    that.setData({
      newNorms: that.data.newNorms
    })
    // 获取所有的选中规格尺寸数据
    var needSelectNum = that.data.newNorms.length;
    var curSelectNum = 0;
    var propertyChildIds = "";
    var propertyChildNames = "";
    var normInfo = []
    for (var i = 0; i < that.data.newNorms.length; i++) {
      childs = that.data.newNorms[i].options[0];

      for (var j = 0; j < childs.length; j++) {
        if (childs[j].active) {
          curSelectNum++;
          normInfo.push(childs[j].name)
          // propertyChildIds = propertyChildIds + that.data.goodsDetail.norms[i].id + ":" + childs[j].id + ",";
          propertyChildNames = propertyChildNames + that.data.newNorms[i].name + ":" + childs[j].name + "  ";

        }
      }
    }

    // console.log(propertyChildNames)
    var canSubmit = false;
    //当所提供的商品特征都选择后，则可以进行价格请求
    if (needSelectNum == curSelectNum) {
      canSubmit = true;
      that.setData({
        canJia: true,
        propertyChildNames: propertyChildNames,
        normInfo: normInfo
      });
    }
    // console.log(that.data.canJia)
    // 请求库存   /sku/query
    if (canSubmit) {
      wx.request({
        // 获取到商品的价格规格信息
        url: 'http://47.99.112.182:4030/v1/' + 'sku/query',
        method: 'POST',
        data: {
          productID: that.data.goodsDetail.id,
          normInfo: normInfo
        },
        success: function(res) {
          console.log(res.data.data)
          that.setData({
            buyNumMax: res.data.data.inStockCount,
            buyNumber: (res.data.data.inStockCount > 0) ? 1 : 0,
            id: res.data.data.id,
            price: res.data.data.price,

          });
        }
      })
    }


    this.setData({
      goodsDetail: that.data.goodsDetail,
      canSubmit: canSubmit
    })
  },
  /**
   * 加入购物车
   */
  addShopCar: function() {
    if (this.data.goodsDetail.norms && !this.data.canSubmit) {
      if (!this.data.canSubmit) {
        wx.showModal({
          title: '提示',
          content: '请选择商品规格！',
          showCancel: false
        })
      }
      this.bindGuiGeTap();
      return;
    }
    if (this.data.buyNumber < 1) {
      wx.showModal({
        title: '提示',
        content: '购买数量不能为0！',
        showCancel: false
      })
      return;
    }
    //组建购物车
    this.bulidShopCar();
    this.cartNumber()

    // this.setData({
    //   shopCarInfo: shopCarInfo,
    //   shopNum: shopCarInfo.shopNum
    // });

    // // 写入本地存储
    // wx.setStorage({
    //   key: 'shopCarInfo',
    //   data: shopCarInfo
    // })
    this.closePopupTap();
    wx.showToast({
      title: '加入购物车成功',
      icon: 'success',
      duration: 2000
    })
    //console.log(shopCarInfo);

    //shopCarInfo = {shopNum:12,shopList:[]}
  },

  //请求购物车数量
  cartNumber: function() {
    wx.request({
      url: 'http://47.99.112.182:4030/v1/cart/query',
      method: 'POST',
      data: {
        userId: wx.getStorageSync('user').id
      },
      success: (res) => {
        this.setData({
          shopNum:res.data.data.length
        })
       
      }
    })
  },
  /**
   * 立即购买
   */
  buyNow: function(e) {
    let that = this
    //获取购物类型，拼团&购买
    let shoptype = e.currentTarget.dataset.shoptype
    if (this.data.goodsDetail.norms && !this.data.canSubmit) {

      if (!this.data.canSubmit) {

        wx.showModal({
          title: '提示',
          content: '请选择商品规格！',
          showCancel: false
        })
      }
      this.bindGuiGeTap();
      wx.showModal({
        title: '提示',
        content: '请先选择规格尺寸哦~',
        showCancel: false
      })
      return;
    }
    if (this.data.buyNumber < 1) {
      wx.showModal({
        title: '提示',
        content: '购买数量不能为0！',
        showCancel: false
      })
      return;
    }
    //组建立即购买信息
    // this.bulidShopCar();
    this.closePopupTap();
    // 写入本地存储
    var buyNowInfo = this.buliduBuyNowInfo()
    console.log(11)
    wx.setStorage({
      key: "buyNowInfo",
      data: buyNowInfo
    })
    console.log(22)

    wx.navigateTo({
      url: "/pages/to-pay-order/index?orderType=buyNow"
    })


    //有拼团
    // if (shoptype == 'toPingtuan') {
    //   wx.request({
    //     url: 'https://api.it120.cc/' + app.globalData.subDomain + '/shop/goods/pingtuan/open',
    //     data: {
    //       token: wx.getStorageSync('token'),
    //       goodsId: that.data.goodsDetail.basicInfo.id
    //     },
    //     success: function(res) {
    //       if (res.data.code != 0) {
    //         wx.showToast({
    //           title: res.data.msg,
    //           icon: 'none',
    //           duration: 2000
    //         })
    //         return
    //       }
    //       wx.navigateTo({
    //         url: "/pages/to-pay-order/index?orderType=buyNow&pingtuanOpenId=" + res.data.data.id
    //       })
    //     }
    //   })
    // } else {
    //   wx.navigateTo({
    //     url: "/pages/to-pay-order/index?orderType=buyNow"
    //   })
    // }


    //无拼团
    wx.navigateTo({
      url: "/pages/to-pay-order/index?orderType=buyNow"
    })
  },
  /**
   * 创建购物车
   */
  bulidShopCar: function() {
    console.log(wx.getStorageSync('user'))
    var that = this
    // console.log(that.data)
    //创建购物车  /cart/
    wx.request({
      // 获取到商品的价格规格信息
      url: 'http://47.99.112.182:4030/v1/' + 'cart',
      method: 'POST',
      data: {
        userId: wx.getStorageSync('user').id,
        skuid: that.data.id,
        number: that.data.buyNumber,
        productId: that.data.goodsDetail.id
      },
      success: function(res) {
        that.setData({
          orderid: res.data.data.id,
          skuid: res.data.data.sku_id,
          price: res.data.data.score,
        });
      }
    })

    
    // // 加入购物车
    // var shopCarMap = {};
    // shopCarMap.goodsId = this.data.goodsDetail.basicInfo.id;
    // shopCarMap.pic = this.data.goodsDetail.basicInfo.pic;
    // shopCarMap.name = this.data.goodsDetail.basicInfo.name;
    // // shopCarMap.label=this.data.goodsDetail.basicInfo.id; 规格尺寸 
    // shopCarMap.propertyChildIds = this.data.propertyChildIds;
    // shopCarMap.label = this.data.propertyChildNames;
    // shopCarMap.price = this.data.selectSizePrice;
    // shopCarMap.score = this.data.totalScoreToPay;
    // shopCarMap.left = "";
    // shopCarMap.active = true;
    // shopCarMap.number = this.data.buyNumber;
    // shopCarMap.logisticsType = this.data.goodsDetail.basicInfo.logisticsId;
    // shopCarMap.logistics = this.data.goodsDetail.logistics;
    // shopCarMap.weight = this.data.goodsDetail.basicInfo.weight;

    // var shopCarInfo = this.data.shopCarInfo;
    // if (!shopCarInfo.shopNum) {
    //   shopCarInfo.shopNum = 0;
    // }
    // if (!shopCarInfo.shopList) {
    //   shopCarInfo.shopList = [];
    // }
    // var hasSameGoodsIndex = -1;
    // for (var i = 0; i < shopCarInfo.shopList.length; i++) {
    //   var tmpShopCarMap = shopCarInfo.shopList[i];
    //   if (tmpShopCarMap.goodsId == shopCarMap.goodsId && tmpShopCarMap.propertyChildIds == shopCarMap.propertyChildIds) {
    //     hasSameGoodsIndex = i;
    //     shopCarMap.number = shopCarMap.number + tmpShopCarMap.number;
    //     break;
    //   }
    // }

    // shopCarInfo.shopNum = shopCarInfo.shopNum + this.data.buyNumber;
    // if (hasSameGoodsIndex > -1) {
    //   shopCarInfo.shopList.splice(hasSameGoodsIndex, 1, shopCarMap);
    // } else {
    //   shopCarInfo.shopList.push(shopCarMap);
    // }
    // shopCarInfo.kjId = this.data.kjId;
    // return shopCarInfo;
  },
  /**
   * 组建立即购买信息，返回立即购买的信息对象
   */
  buliduBuyNowInfo: function(shoptype) {
    var shopCarMap = {};
    shopCarMap.product = {};
    shopCarMap.sku = {}
    shopCarMap.product.id = this.data.goodsDetail.id;
    shopCarMap.product.pics = this.data.goodsDetail.pics;
    shopCarMap.product.name = this.data.goodsDetail.name;
    shopCarMap.propertyChildIds = this.data.propertyChildIds;
    shopCarMap.label = this.data.propertyChildNames;
    shopCarMap.product.shopPrice = this.data.selectSizePrice;
    console.log(this.data.id)
    shopCarMap.sku.id = this.data.id;
    shopCarMap.sku.inStockCount = this.data.buyNumMax;
    shopCarMap.sku.normInfo = this.data.normInfo;
    shopCarMap.sku.price = this.data.price;
    console.log(this.data.goodsDetail.id)
    shopCarMap.sku.productID = this.data.goodsDetail.id
    shopCarMap.left = "";
    shopCarMap.active = true;
    shopCarMap.number = this.data.buyNumber;

    var buyNowInfo = {};

    buyNowInfo.shoptotalPriceNum = this.data.buyNumber * this.data.selectSizePrice;

    if (!buyNowInfo.shopList) {
      buyNowInfo.shopList = [];
    }

    buyNowInfo.shopList.push(shopCarMap);

    return buyNowInfo;
  },
  //用户点击转发
  onShareAppMessage: function() {
    return {
      title: this.data.goodsDetail.name,
      path: '/pages/goods-details/index?id=' + this.data.goodsDetail.id + '&inviter_id=' + wx.getStorageSync('uid'),
      success: function(res) {
        console.log('转发成功')
      },
      fail: function(res) {
        console.log('转发失败')
      }
    }
  },
  // reputation: function(goodsId) {
  //   var that = this;
  //   wx.request({
  //     //获取商品评论列表
  //     url: 'https://api.it120.cc/' + app.globalData.subDomain + '/shop/goods/reputation',
  //     data: {
  //       goodsId: goodsId
  //     },
  //     success: function(res) {
  //       if (res.data.code == 0) {
  //         //console.log(res.data.data);
  //         that.setData({
  //           reputation: res.data.data
  //         });
  //       }
  //     }
  //   })
  // },
  // pingtuanList: function(goodsId) {
  //   var that = this;
  //   wx.request({
  //     //获取拼团列表
  //     url: 'https://api.it120.cc/' + app.globalData.subDomain + '/shop/goods/pingtuan/list',
  //     data: {
  //       goodsId: goodsId
  //     },
  //     success: function(res) {
  //       if (res.data.code == 0) {
  //         that.setData({
  //           pingtuanList: res.data.data
  //         });
  //       }
  //     }
  //   })
  // },
  // //获取视频文件地址
  // getVideoSrc: function(videoId) {
  //   var that = this;
  //   wx.request({
  //     url: 'https://api.it120.cc/' + app.globalData.subDomain + '/media/video/detail',
  //     data: {
  //       videoId: videoId
  //     },
  //     success: function(res) {
  //       if (res.data.code == 0) {
  //         that.setData({
  //           videoMp4Src: res.data.data.fdMp4
  //         });
  //       }
  //     }
  //   })
  // },
  //获取砍价信息
  // getKanjiaInfo: function(gid) {
  //   var that = this;
  //   if (!app.globalData.kanjiaList || app.globalData.kanjiaList.length == 0) {
  //     that.setData({
  //       curGoodsKanjia: null
  //     });
  //     return;
  //   }
  //   let curGoodsKanjia = app.globalData.kanjiaList.find(ele => {
  //     return ele.goodsId == gid
  //   });
  //   if (curGoodsKanjia) {
  //     that.setData({
  //       curGoodsKanjia: curGoodsKanjia
  //     });
  //   } else {
  //     that.setData({
  //       curGoodsKanjia: null
  //     });
  //   }
  // },
  //点击邀请好友砍价
  // goKanjia: function() {
  //   var that = this;
  //   if (!that.data.curGoodsKanjia) {
  //     return;
  //   }
  //   wx.request({
  //     //获取砍价相关信息
  //     url: 'https://api.it120.cc/' + app.globalData.subDomain + '/shop/goods/kanjia/join',
  //     data: {
  //       kjid: that.data.curGoodsKanjia.id,
  //       token: wx.getStorageSync('token')
  //     },
  //     success: function(res) {
  //       if (res.data.code == 0) {
  //         console.log(res.data);
  //         //跳转至砍价页面
  //         wx.navigateTo({
  //           url: "/pages/kanjia/index?kjId=" + res.data.data.kjId + "&joiner=" + res.data.data.uid + "&id=" + res.data.data.goodsId
  //         })
  //       } else {
  //         wx.showModal({
  //           title: '错误',
  //           content: res.data.msg,
  //           showCancel: false
  //         })
  //       }
  //     }
  //   })
  // },
  //点击去拼单
  // joinPingtuan: function(e) {
  //   console.log(e)
  //   let pingtuanopenid = e.currentTarget.dataset.pingtuanopenid
  //   //跳转到拼单页面
  //   wx.navigateTo({
  //     url: "/pages/to-pay-order/index?orderType=buyNow&pingtuanOpenId=" + pingtuanopenid
  //   })
  // }
})