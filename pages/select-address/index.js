//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
    addressList: []
  },
  //点击，设置默认地址   /user/:id
  selectTap: function(e) {
    var id = e.currentTarget.dataset.id;
    wx.request({
      url: 'http://47.99.112.182:4030/v1/user/'+wx.getStorageSync('user').id,
      method: 'PUT',
      data: {
      
        defaultAddressId: e.currentTarget.dataset.id
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
  //获取用户地址列表  /address/query
  initShippingAddress: function() {
    var that = this;
    //获取默认地址
    wx.request({
      url: 'http://47.99.112.182:4030/v1/user/'+wx.getStorageSync('user').id,
      success: (res) => {
        let defaultAddressId = res.data.data.defaultAddressId
        wx.request({
          url: 'http://47.99.112.182:4030/v1/address/query',
          method: 'POST',
          data: {
            userID: wx.getStorageSync('user').id
          },
          success: (res) => {
            if (res.data.code == 0) {
              res.data.data.forEach(v => {
                if (v.id == defaultAddressId) {
                 
                  v.isDefault = true;
                }
              })
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
    //获取地址列表
   
  }

})