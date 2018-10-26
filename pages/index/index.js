//index.js
//获取应用实例
var app = getApp()

Page({
  data: {
    indicatorDots: true,
    autoplay: true,
    interval: 3000,
    duration: 1000,
    loadingHidden: false , // loading
    userInfo: {},
    swiperCurrent: 0,  
    selectCurrent:0,
    categories: [],
    activeCategoryId: 0,
    goods:[],
    scrollTop:0,
    loadingMoreHidden:true,

    hasNoCoupons:true,
    coupons: [],
    searchInput: '',

    curPage:1,
    pageSize:20
  },

  tabClick: function (e) {
    this.setData({
      activeCategoryId: e.currentTarget.id,
      curPage: 1
    });
    //TODO 调用API获得商品列表
    this.getGoodsList(this.data.activeCategoryId);
  },
  //滑动图片事件处理函数
  swiperchange: function(e) {
      //console.log(e.detail.current)
       this.setData({  
        swiperCurrent: e.detail.current  
    })  
  },
  toDetailsTap:function(e){
    //TODO 跳转到商品详情页
    wx.navigateTo({
      url:"/pages/goods-details/index?id="+e.currentTarget.dataset.id
    })
  },
  tapBanner: function(e) {
    if (e.currentTarget.dataset.id != 0) {
      wx.navigateTo({
        url: "/pages/goods-details/index?id=" + e.currentTarget.dataset.id
      })
    }
  },
  //没用过这个函数
  bindTypeTap: function(e) {
     this.setData({  
        selectCurrent: e.index  
    })  
  },
  onLoad: function () {
    var that = this
    wx.setNavigationBarTitle({
      title: wx.getStorageSync('mallName')
    })
    // TODO 获得轮播banner图片
    wx.request({
      url: 'https://api.it120.cc/' + app.globalData.subDomain + '/banner/list',
      data: {
        key: 'mallName'
      },
      success: function(res) {
        if (res.data.code == 404) {
          wx.showModal({
            title: '提示',
            content: '请在后台添加 banner 轮播图片',
            showCancel: false
          })
        } else {
          that.setData({
            banners: res.data.data
          });
        }
      }
    }),
    // TODO 获得所有分类
    wx.request({
      url: 'https://api.it120.cc/'+ app.globalData.subDomain +'/shop/goods/category/all',
      success: function(res) {
        var categories = [{id:0, name:"全部"}];
        if (res.data.code == 0) {
          for (var i = 0; i < res.data.data.length; i++) {
            categories.push(res.data.data[i]);
          }
        }
        that.setData({
          categories:categories,
          activeCategoryId:0,
          curPage: 1
        });
        // TODO 获得一页商品
        that.getGoodsList(0);
      }
    })
    // TODO 获取优惠卷 此版本先不添加
    that.getCoupons ();
    // TODO 获取公告 优先级拍后
    that.getNotice ();
  },
  //获取滚动高度
  onPageScroll(e) {
    let scrollTop = this.data.scrollTop
    this.setData({
      scrollTop: e.scrollTop
    })
   },
  getGoodsList: function (categoryId, append) {
    if (categoryId == 0) {
      categoryId = "";
    }
    var that = this;
    wx.showLoading({
      "mask":true
    })
    wx.request({
      // TODO 搜索商品
      url: 'https://api.it120.cc/'+ app.globalData.subDomain +'/shop/goods/list',
      data: {
        categoryId: categoryId,
        nameLike: that.data.searchInput,
        page: this.data.curPage,
        pageSize: this.data.pageSize
      },
      success: function(res) {
        wx.hideLoading()        
        if (res.data.code == 404 || res.data.code == 700){
          let newData = { loadingMoreHidden: false }
          if (!append) {
            newData.goods = []
          }
          that.setData(newData);
          return
        }
        let goods = [];
        if (append) {
          goods = that.data.goods
        }        
        for(var i=0;i<res.data.data.length;i++){
          goods.push(res.data.data[i]);
        }
        that.setData({
          loadingMoreHidden: true,
          goods:goods,
        });
      }
    })
  },
  getCoupons: function () {
    var that = this;
    wx.request({
      // TODO 获取优惠劵
      url: 'https://api.it120.cc/' + app.globalData.subDomain + '/discounts/coupons',
      data: {
        type: ''
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            hasNoCoupons: false,
            coupons: res.data.data
          });
        }
      }
    })
  },
  gitCoupon : function (e) {
    var that = this;
    wx.request({
      // TODO 用户点击获取优惠劵
      url: 'https://api.it120.cc/' + app.globalData.subDomain + '/discounts/fetch',
      data: {
        id: e.currentTarget.dataset.id,
        token: wx.getStorageSync('token')//用token来记录用户
      },
      success: function (res) {
        if (res.data.code == 20001 || res.data.code == 20002) {
          wx.showModal({
            title: '错误',
            content: '来晚了',
            showCancel: false
          })
          return;
        }
        if (res.data.code == 20003) {
          wx.showModal({
            title: '错误',
            content: '你领过了，别贪心哦~',
            showCancel: false
          })
          return;
        }
        if (res.data.code == 30001) {
          wx.showModal({
            title: '错误',
            content: '您的积分不足',
            showCancel: false
          })
          return;
        }
        if (res.data.code == 20004) {
          wx.showModal({
            title: '错误',
            content: '已过期~',
            showCancel: false
          })
          return;
        }
        if (res.data.code == 0) {
          wx.showToast({
            title: '领取成功，赶紧去下单吧~',
            icon: 'success',
            duration: 2000
          })
        } else {
          wx.showModal({
            title: '错误',
            content: res.data.msg,
            showCancel: false
          })
        }
      }
    })
  },
  //用户转发操作
  onShareAppMessage: function () {
    return {
      //设置转发界面的文字和点击进入页面路径
      title: wx.getStorageSync('mallName') + '——' + app.globalData.shareProfile,
      path: '/pages/index/index',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  getNotice: function () {
    var that = this;
    wx.request({
      //获取公告列表
      url: 'https://api.it120.cc/' + app.globalData.subDomain + '/notice/list',
      data: { pageSize :5},
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            noticeList: res.data.data
          });
        }
      }
    })
  },
  //监听搜索框的输入
  listenerSearchInput: function (e) {
    this.setData({
      searchInput: e.detail.value
    })

  },
  //点击搜索后执行函数
  toSearch : function (){
    this.setData({
      //展示的页数
      curPage: 1
    });
    this.getGoodsList(this.data.activeCategoryId);
  },
  //下拉至第一页结束
  onReachBottom: function () {
    this.setData({
      curPage: this.data.curPage+1
    });
    this.getGoodsList(this.data.activeCategoryId, true)
  },
  //下拉刷新操作
  onPullDownRefresh: function(){
    this.setData({
      //展示第一页
      curPage: 1
    });
    //从新获取数据
    this.getGoodsList(this.data.activeCategoryId)
  }
})
