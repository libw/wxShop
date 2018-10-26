//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
    addressList: []
  },
  //点击，设置默认地址
  selectTap: function(e) {
    var id = e.currentTarget.dataset.id;
    wx.request({
      url: 'https://api.it120.cc/' + app.globalData.subDomain + '/user/shipping-address/update',
      data: {
        token: wx.getStorageSync('token'),
        id: id,
        isDefault: 'true'
      },
      success: (res) => {
        wx.navigateBack({})
      }
    })
  },
  //点击添加地址
  addAddess: function() {
    wx.navigateTo({
      url: "/pages/address-add/index"
    })
  },
  //点击编辑地址
  editAddess: function(e) {
    wx.navigateTo({
      url: "/pages/address-add/index?id=" + e.currentTarget.dataset.id
    })
  },

  onLoad: function() {
    console.log('onLoad')


  },
  onShow: function() {
    this.initShippingAddress();
  },
  //获取用户地址列表
  initShippingAddress: function() {
    var that = this;
    wx.request({
      url: 'https://api.it120.cc/' + app.globalData.subDomain + '/user/shipping-address/list',
      data: {
        token: wx.getStorageSync('token')
      },
      success: (res) => {
        if (res.data.code == 0) {
          that.setData({
            addressList: res.data.data
          });
        } else if (res.data.code == 700) {
          that.setData({
            addressList: null
          });
        }
      }
    })
  }

})