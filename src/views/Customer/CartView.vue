<template>
  <div class="cart-page">
    <div class="breadcrumb">
      <span class="bc-link" @click="$router.back()">香客帳號管理</span>
      <span class="bc-sep">&#x203a;</span>
      <span class="bc-current">購物車</span>
    </div>
    <div class="cart-layout">
      <div class="cart-main">
        <div v-if="cartItems.length===0" class="cart-empty">
          <div class="empty-icon">&#x1F6D2;</div>
          <div class="empty-text">購物車是空的</div>
        </div>
        <div v-for="temple in groupedByTemple" :key="temple.templeId" class="temple-group">
          <div class="temple-header">
            <label class="checkbox-wrap">
              <input type="checkbox" :checked="isTempleAllChecked(temple.templeId)" :indeterminate.prop="isTempleIndeterminate(temple.templeId)" @change="toggleTemple(temple.templeId,$event.target.checked)" class="cb"/>
              <span class="cb-box"></span>
            </label>
            <span class="temple-name">{{ temple.templeName }}</span>
          </div>
          <div v-for="item in temple.items" :key="item.cartId" class="item-card">
            <div class="item-main">
              <label class="checkbox-wrap">
                <input type="checkbox" v-model="item.checked" class="cb"/>
                <span class="cb-box"></span>
              </label>
              <img :src="item.image" class="item-img"/>
              <div class="item-info">
                <div class="item-name">{{ item.name }}</div>
                <span class="type-badge" :class="item.type">{{ typeLabel(item.type) }}</span>
              </div>
              <select v-model="item.spec" class="spec-select">
                <option v-for="s in item.specs" :key="s.value" :value="s.value">{{ s.label }}</option>
              </select>
              <div class="item-qty">
                <button class="qty-btn" @click="changeQty(item,-1)" :disabled="item.qty<=1">&#xFF0D;</button>
                <span class="qty-num">{{ item.qty }}</span>
                <button class="qty-btn" @click="changeQty(item,1)">&#xFF0B;</button>
              </div>
              <div class="item-price-col">
                <div class="item-price">NT$ {{ (item.price*item.qty).toLocaleString() }}</div>
                <div v-if="item.specialShipping" class="special-ship">特殊運費 NT$ {{ item.specialShipping }}</div>
              </div>
              <button class="del-btn" @click="removeItem(item.cartId)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>
              </button>
            </div>
            <div v-if="(item.type==='service'||item.type==='donation')&&item.checked" class="target-section">
              <div class="ts-header">
                <span class="ts-title">服務對象設定 <em class="req">*</em></span>
                <span class="ts-hint">（需設定 {{ item.qty }} 位）</span>
              </div>
              <div v-for="(tgt,ti) in item.targets" :key="ti" class="target-card">
                <div class="target-row" @click="tgt.open=!tgt.open">
                  <span class="tgt-label">服務對象 {{ ti+1 }}</span>
                  <span class="tgt-badge" :class="tgt.filled?'filled':'pending'">{{ tgt.filled?'已設定':'待設定' }}</span>
                  <svg class="tgt-arrow" :class="{open:tgt.open}" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
                </div>
                <div v-show="tgt.open" class="target-body">
                  <div class="tgt-tabs">
                    <button v-for="tab in targetTabs" :key="tab.v" class="tgt-tab" :class="{active:tgt.tab===tab.v}" @click="switchTab(tgt,tab.v)">{{ tab.l }}</button>
                  </div>
                  <template v-if="tgt.tab==='manual'||tgt.tab==='personal'">
                    <div class="frow">
                      <div class="ff"><label>姓名 <em class="req">*</em></label><input v-model="tgt.name" class="fi" placeholder="請輸入姓名"/></div>
                      <div class="ff"><label>性別 <em class="req">*</em></label>
                        <select v-model="tgt.gender" class="fi-sel">
                          <option value="">請選擇</option><option>男</option><option>女</option>
                        </select>
                      </div>
                    </div>
                    <div class="frow">
                      <div class="ff"><label>生日 <em class="req">*</em></label><input v-model="tgt.birthday" class="fi" placeholder="年/月/日"/></div>
                      <div class="ff"><label>手機 <em class="req">*</em></label><input v-model="tgt.phone" class="fi" placeholder="請輸入手機號碼"/></div>
                    </div>
                    <div class="frow"><div class="ff full"><label>Email <em class="req">*</em></label><input v-model="tgt.email" class="fi" placeholder="請輸入Email"/></div></div>
                    <div class="frow"><div class="ff full"><label>地址</label><input v-model="tgt.address" class="fi" placeholder="請輸入地址"/></div></div>
                  </template>
                  <template v-else-if="tgt.tab==='family'">
                    <div class="frow">
                      <div class="ff full"><label>選擇家人</label>
                        <select v-model="tgt.selFamily" @change="fillFamily(tgt)" class="fi-sel">
                          <option value="">待設定</option>
                          <option v-for="f in familyProfiles" :key="f.id" :value="f.id">{{ f.name }}</option>
                        </select>
                      </div>
                    </div>
                    <div class="frow">
                      <div class="ff"><label>姓名 <em class="req">*</em></label><input v-model="tgt.name" class="fi" :readonly="!!tgt.selFamily"/></div>
                      <div class="ff"><label>性別 <em class="req">*</em></label>
                        <select v-model="tgt.gender" class="fi-sel" :disabled="!!tgt.selFamily">
                          <option value="">請選擇</option><option>男</option><option>女</option>
                        </select>
                      </div>
                    </div>
                    <div class="frow">
                      <div class="ff"><label>生日 <em class="req">*</em></label><input v-model="tgt.birthday" class="fi" :readonly="!!tgt.selFamily"/></div>
                      <div class="ff"><label>手機 <em class="req">*</em></label><input v-model="tgt.phone" class="fi" :readonly="!!tgt.selFamily"/></div>
                    </div>
                    <div class="frow"><div class="ff full"><label>Email <em class="req">*</em></label><input v-model="tgt.email" class="fi" :readonly="!!tgt.selFamily"/></div></div>
                    <div class="frow"><div class="ff full"><label>地址</label><input v-model="tgt.address" class="fi" :readonly="!!tgt.selFamily"/></div></div>
                  </template>
                  <template v-else-if="tgt.tab==='company'">
                    <div class="frow">
                      <div class="ff full"><label>選擇公司</label>
                        <select v-model="tgt.selCompany" @change="fillCompany(tgt)" class="fi-sel">
                          <option value="">請選擇</option>
                          <option v-for="c in companyProfiles" :key="c.id" :value="c.id">{{ c.name }}（統編：{{ c.taxId }}）</option>
                        </select>
                      </div>
                    </div>
                    <div class="frow">
                      <div class="ff"><label>公司名稱 <em class="req">*</em></label><input v-model="tgt.companyName" class="fi" :readonly="!!tgt.selCompany"/></div>
                      <div class="ff"><label>公司電話 <em class="req">*</em></label><input v-model="tgt.companyPhone" class="fi" :readonly="!!tgt.selCompany"/></div>
                    </div>
                    <div class="frow"><div class="ff full"><label>公司地址 <em class="req">*</em></label><input v-model="tgt.companyAddress" class="fi" :readonly="!!tgt.selCompany"/></div></div>
                    <div class="frow">
                      <div class="ff"><label>統一編號 <em class="req">*</em></label><input v-model="tgt.taxId" class="fi" :readonly="!!tgt.selCompany"/></div>
                      <div class="ff"><label>負責人姓名 <em class="req">*</em></label><input v-model="tgt.ownerName" class="fi" :readonly="!!tgt.selCompany"/></div>
                    </div>
                    <div class="frow"><div class="ff full"><label>負責人地址 <em class="req">*</em></label><input v-model="tgt.ownerAddress" class="fi" :readonly="!!tgt.selCompany"/></div></div>
                  </template>
                  <div class="tgt-actions">
                    <button class="btn-save-tgt" @click="saveTgt(tgt)">確認儲存</button>
                    <button class="btn-cancel-tgt" @click="tgt.open=false">取消變更</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="temple-footer">
            <div class="tf-row">
              <span class="tf-label">運費：</span>
              <div class="tf-right">
                <span class="tf-val">NT$ {{ templeShipping(temple).toLocaleString() }}</span>
                <span class="tf-hint">普通運費 ${{ templeNormalShip(temple) }} + 特殊運費 ${{ templeSpecialShip(temple) }}</span>
              </div>
            </div>
            <div class="tf-row">
              <span class="tf-label">商品金額：</span>
              <span class="tf-val">NT$ {{ templeItemTotal(temple).toLocaleString() }}</span>
            </div>
            <div class="tf-row">
              <span class="tf-label">小計：</span>
              <span class="tf-subtotal">NT$ {{ (templeItemTotal(temple)+templeShipping(temple)).toLocaleString() }}</span>
            </div>
          </div>
        </div>
        <div class="extra-card">
          <div class="extra-block">
            <div class="extra-title">感謝狀統一寄送至我的email</div>
            <label class="rl"><input type="radio" v-model="thankYouEmail" value="unified"/> 是</label>
            <label class="rl"><input type="radio" v-model="thankYouEmail" value="each"/> 否，依服務對象的email寄送</label>
          </div>
          <div class="extra-block">
            <div class="extra-title">發票設定 <em class="req">*</em></div>
            <label class="rl"><input type="radio" v-model="invoiceType" value="personal"/> 個人</label>
            <label class="rl"><input type="radio" v-model="invoiceType" value="company"/> 公司（統編）</label>
            <label class="rl"><input type="radio" v-model="invoiceType" value="donate"/> 捐贈</label>
          </div>
        </div>
        <div class="rec-card">
          <div class="rec-title">您可能也喜歡</div>
          <div class="rec-grid">
            <div v-for="rec in recommendations" :key="rec.id" class="rec-item">
              <img :src="rec.image" class="rec-img"/>
              <div class="rec-temple">{{ rec.temple }}</div>
              <div class="rec-name">{{ rec.name }}</div>
              <div class="rec-bottom">
                <span class="rec-price">NT$ {{ rec.price }}</span>
                <button class="rec-btn" @click="addRecommend(rec)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="summary-panel">
        <div class="sp-title">結帳摘要</div>
        <div class="sp-row"><span>商品總數</span><span>{{ checkedCount }} 件</span></div>
        <div class="sp-row"><span>小計</span><span>NT$ {{ checkedItemTotal.toLocaleString() }}</span></div>
        <div class="sp-row"><span>運費</span><span>NT$ {{ checkedShippingTotal.toLocaleString() }}</span></div>
        <div class="sp-divider"></div>
        <div class="sp-total-row"><span>應付總額</span><span class="sp-total">NT$ {{ grandTotal.toLocaleString() }}</span></div>
        <button class="btn-checkout" :class="{disabled:!canCheckout}" :disabled="!canCheckout" @click="checkout">前往結帳</button>
        <div v-if="!canCheckout" class="checkout-warn">請完成所有必填設定</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const targetTabs=[{v:'manual',l:'自行輸入'},{v:'personal',l:'個人'},{v:'family',l:'家人資訊'},{v:'company',l:'公司資料'}]

const personalProfiles=ref([
  {id:1,name:'王小明',gender:'男',birthday:'1990/05/15',phone:'0912-345-678',email:'wang.xiaoming@example.com',address:'台北市中山區民權東路二段109號'},
])
const familyProfiles=ref([
  {id:1,name:'王大明',gender:'男',birthday:'1960/03/20',phone:'0911-111-222',email:'wang.daming@example.com',address:'台北市中山區民權東路二段109號'},
  {id:2,name:'王小美',gender:'女',birthday:'1992/07/08',phone:'0933-444-555',email:'wang.meimei@example.com',address:'台北市大安區信義路三段50號'},
])
const companyProfiles=ref([
  {id:1,name:'宮掌櫃科技股份有限公司',taxId:'12345678',phone:'02-2345-6789',address:'台北市信義區信義路五段7號',ownerName:'陳大華',ownerAddress:'台北市信義區松仁路100號'},
])

const emptyTarget=()=>({
  open:true,tab:'manual',filled:false,
  selProfile:'',selFamily:'',selCompany:'',
  name:'',gender:'',birthday:'',phone:'',email:'',address:'',
  companyName:'',companyPhone:'',companyAddress:'',taxId:'',ownerName:'',ownerAddress:'',
})

const cartItems=ref([
  {cartId:1, templeId:'longshan',templeName:'萬華龍山寺',type:'product', name:'平安符',       image:'/images/product-card/04.png', specs:[{value:'基本版',label:'基本版'},{value:'加持版',label:'加持版'}],                     spec:'基本版', price:200, qty:2,checked:true,specialShipping:null,  targets:[]},
  {cartId:2, templeId:'longshan',templeName:'萬華龍山寺',type:'product', name:'招財錦囊',     image:'/images/product-card/03.png', specs:[{value:'基本版',label:'基本版'},{value:'精裝版',label:'精裝版'}],                     spec:'基本版', price:300, qty:1,checked:true,specialShipping:null,  targets:[]},
  {cartId:3, templeId:'longshan',templeName:'萬華龍山寺',type:'product', name:'文昌筆',       image:'/images/product-card/02.png', specs:[{value:'標準款',label:'標準款'}],                                              spec:'標準款', price:180, qty:1,checked:true,specialShipping:150,   targets:[]},
  {cartId:4, templeId:'longshan',templeName:'萬華龍山寺',type:'product', name:'觀音佛珠手鍊', image:'/images/product-card/01.png', specs:[{value:'檀木款',label:'檀木款'},{value:'水晶款',label:'水晶款'}],                 spec:'檀木款', price:450, qty:1,checked:true,specialShipping:null,  targets:[]},
  {cartId:5, templeId:'longshan',templeName:'萬華龍山寺',type:'service', name:'光明燈服務',   image:'/images/service-card/02.png', specs:[{value:'一年期',label:'一年期'},{value:'三年期',label:'三年期'}],                 spec:'一年期', price:800, qty:1,checked:true,specialShipping:null,  targets:[emptyTarget()]},
  {cartId:6, templeId:'longshan',templeName:'萬華龍山寺',type:'service', name:'安太歲服務',   image:'/images/service-card/01.png', specs:[{value:'個人',label:'個人'},{value:'家庭',label:'家庭'}],                     spec:'個人',   price:600, qty:1,checked:true,specialShipping:null,  targets:[emptyTarget()]},
  {cartId:7, templeId:'longshan',templeName:'萬華龍山寺',type:'donation',name:'中元普渡',     image:'/images/service-card/04.png', specs:[{value:'歷代祖先',label:'歷代祖先'},{value:'普渡眾生',label:'普渡眾生'}],         spec:'歷代祖先',price:1500,qty:1,checked:true,specialShipping:null, targets:[emptyTarget()]},
  {cartId:8, templeId:'xingtian',templeName:'行天宮',    type:'product', name:'關聖帝君護身卡',image:'/images/product-card/03.png',specs:[{value:'卡片版',label:'卡片版'},{value:'吊飾版',label:'吊飾版'}],               spec:'卡片版', price:100, qty:2,checked:true,specialShipping:null,  targets:[]},
  {cartId:9, templeId:'xingtian',templeName:'行天宮',    type:'product', name:'五路財神香包',  image:'/images/product-card/02.png',specs:[{value:'小型',label:'小型'},{value:'大型',label:'大型'}],                     spec:'小型',   price:120, qty:1,checked:true,specialShipping:200,   targets:[]},
  {cartId:10,templeId:'xingtian',templeName:'行天宮',    type:'product', name:'平安米',        image:'/images/product-card/03.png',specs:[{value:'300g',label:'300g'},{value:'600g',label:'600g'}],                  spec:'300g',   price:150, qty:1,checked:true,specialShipping:null,  targets:[]},
  {cartId:11,templeId:'xingtian',templeName:'行天宮',    type:'donation',name:'平安祈福法會',  image:'/images/service-card/01.png',specs:[{value:'個人祈福',label:'個人祈福'},{value:'全家祈福',label:'全家祈福'}],       spec:'個人祈福',price:600, qty:2,checked:true,specialShipping:null, targets:[emptyTarget(),emptyTarget()]},
])

const syncTargets=(item)=>{
  if(item.type!=='service'&&item.type!=='donation') return
  const diff=item.qty-item.targets.length
  if(diff>0) for(let i=0;i<diff;i++) item.targets.push(emptyTarget())
  else if(diff<0) item.targets.splice(item.qty)
}
const changeQty=(item,delta)=>{if(item.qty+delta<1)return;item.qty+=delta;syncTargets(item)}
const removeItem=(id)=>{const i=cartItems.value.findIndex(x=>x.cartId===id);if(i!==-1)cartItems.value.splice(i,1)}

const groupedByTemple=computed(()=>{
  const map={}
  for(const item of cartItems.value){
    if(!map[item.templeId]) map[item.templeId]={templeId:item.templeId,templeName:item.templeName,items:[]}
    map[item.templeId].items.push(item)
  }
  return Object.values(map)
})

const isTempleAllChecked=(id)=>groupedByTemple.value.find(t=>t.templeId===id).items.every(i=>i.checked)
const isTempleIndeterminate=(id)=>{
  const g=groupedByTemple.value.find(t=>t.templeId===id);const n=g.items.filter(i=>i.checked).length;return n>0&&n<g.items.length
}
const toggleTemple=(id,val)=>groupedByTemple.value.find(t=>t.templeId===id).items.forEach(i=>{i.checked=val})
const typeLabel=(t)=>({product:'商品',service:'服務',donation:'捐款'}[t]||t)

const fillProfile=(tgt)=>{const p=personalProfiles.value.find(x=>x.id===Number(tgt.selProfile));if(p)Object.assign(tgt,{name:p.name,gender:p.gender,birthday:p.birthday,phone:p.phone,email:p.email,address:p.address})}
const fillFamily =(tgt)=>{const f=familyProfiles.value.find(x=>x.id===Number(tgt.selFamily));  if(f)Object.assign(tgt,{name:f.name,gender:f.gender,birthday:f.birthday,phone:f.phone,email:f.email,address:f.address})}
const fillCompany=(tgt)=>{const c=companyProfiles.value.find(x=>x.id===Number(tgt.selCompany));if(c)Object.assign(tgt,{companyName:c.name,companyPhone:c.phone,companyAddress:c.address,taxId:c.taxId,ownerName:c.ownerName,ownerAddress:c.ownerAddress})}
const switchTab=(tgt,tab)=>{
  tgt.tab=tab
  Object.assign(tgt,{selProfile:'',selFamily:'',selCompany:'',name:'',gender:'',birthday:'',phone:'',email:'',address:'',companyName:'',companyPhone:'',companyAddress:'',taxId:'',ownerName:'',ownerAddress:''})
  if(tab==='personal'&&personalProfiles.value.length>0){
    const p=personalProfiles.value[0]
    Object.assign(tgt,{selProfile:p.id,name:p.name,gender:p.gender,birthday:p.birthday,phone:p.phone,email:p.email,address:p.address})
  }
}
const saveTgt=(tgt)=>{const ok=tgt.tab==='company'?tgt.companyName&&tgt.taxId&&tgt.ownerName:tgt.name&&tgt.gender&&tgt.birthday&&tgt.phone&&tgt.email;tgt.filled=!!ok;tgt.open=false}

const NORMAL_SHIP=60
const templeNormalShip=(t)=>t.items.some(i=>i.checked&&i.type==='product'&&!i.specialShipping)?NORMAL_SHIP:0
const templeSpecialShip=(t)=>t.items.filter(i=>i.checked&&i.specialShipping).reduce((s,i)=>s+i.specialShipping,0)
const templeShipping=(t)=>templeNormalShip(t)+templeSpecialShip(t)
const templeItemTotal=(t)=>t.items.filter(i=>i.checked).reduce((s,i)=>s+i.price*i.qty,0)

const checkedItems=computed(()=>cartItems.value.filter(i=>i.checked))
const checkedCount=computed(()=>checkedItems.value.reduce((s,i)=>s+i.qty,0))
const checkedItemTotal=computed(()=>checkedItems.value.reduce((s,i)=>s+i.price*i.qty,0))
const checkedShippingTotal=computed(()=>groupedByTemple.value.reduce((s,t)=>s+templeShipping(t),0))
const grandTotal=computed(()=>checkedItemTotal.value+checkedShippingTotal.value)
const canCheckout=computed(()=>checkedItems.value.every(item=>(item.type!=='service'&&item.type!=='donation')||item.targets.every(t=>t.filled)))
const checkout=()=>{if(canCheckout.value)alert('前往結帳！')}

const thankYouEmail=ref('unified')
const invoiceType=ref('personal')
const recommendations=ref([
  {id:1,temple:'松山慈祐宮',name:'健康長壽符',price:200,image:'/images/product-card/01.png'},
  {id:2,temple:'北港朝天宮',name:'事業亨通符',price:220,image:'/images/product-card/02.png'},
  {id:3,temple:'孔廟',      name:'金榜題名符',price:180,image:'/images/product-card/03.png'},
  {id:4,temple:'天后宮',    name:'闔家平安符',price:280,image:'/images/product-card/04.png'},
  {id:5,temple:'關渡宮',    name:'五路財神符',price:350,image:'/images/product-card/01.png'},
])
const addRecommend=(rec)=>alert(`已將「${rec.name}」加入購物車`)
</script>

<style scoped>
.cart-page{padding:20px 32px 80px;background:#F3F4F6;min-height:100vh;font-family:'PingFang TC','Noto Sans TC',sans-serif;}
.breadcrumb{font-size:13px;color:#999;margin-bottom:20px;display:flex;align-items:center;gap:6px;}
.bc-link{color:#E8572A;cursor:pointer;}
.bc-link:hover{text-decoration:underline;}
.bc-sep,.bc-current{color:#ccc;}
.bc-current{color:#444;}
.cart-layout{display:grid;grid-template-columns:1fr 300px;gap:24px;align-items:start;}
.cart-empty{text-align:center;padding:80px 0;color:#888;font-size:16px;}
.empty-icon{font-size:3rem;margin-bottom:12px;}
.temple-group{background:#fff;border-radius:16px;overflow:hidden;margin-bottom:20px;box-shadow:0 1px 6px rgba(0,0,0,.06);}
.temple-header{display:flex;align-items:center;gap:12px;padding:16px 24px;border-bottom:1px solid #f0f0f0;}
.temple-name{font-size:15px;font-weight:700;color:#E8572A;}
.checkbox-wrap{position:relative;display:flex;align-items:center;cursor:pointer;}
.checkbox-wrap .cb{position:absolute;opacity:0;width:0;height:0;}
.cb-box{width:20px;height:20px;border:2px solid #ddd;border-radius:6px;display:flex;align-items:center;justify-content:center;transition:all .15s;flex-shrink:0;}
.cb:checked+.cb-box{background:#E8572A;border-color:#E8572A;}
.cb:checked+.cb-box::after{content:'';display:block;width:5px;height:9px;border:2px solid #fff;border-top:none;border-left:none;transform:rotate(45deg) translate(-1px,-1px);}
.item-card{border-bottom:1px solid #f5f5f5;}
.item-card:last-child{border-bottom:none;}
.item-main{display:flex;align-items:center;gap:14px;padding:18px 24px;}
.item-img{width:70px;height:70px;border-radius:10px;object-fit:cover;flex-shrink:0;}
.item-info{flex:1;min-width:0;}
.item-name{font-size:14px;font-weight:600;color:#222;margin-bottom:5px;}
.type-badge{display:inline-block;padding:2px 9px;border-radius:20px;font-size:11px;font-weight:600;}
.type-badge.product{background:#e8f4ff;color:#2563eb;}
.type-badge.service{background:#fff3e0;color:#e67e00;}
.type-badge.donation{background:#fce4ec;color:#c2185b;}
.spec-select{padding:7px 28px 7px 12px;border:1px solid #e0e0e0;border-radius:999px;font-size:13px;color:#333;background:#fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='7'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23999' stroke-width='1.5' fill='none'/%3E%3C/svg%3E") no-repeat right 10px center;appearance:none;cursor:pointer;min-width:100px;flex-shrink:0;}
.spec-select:focus{outline:none;border-color:#E8572A;}
.item-qty{display:flex;align-items:center;flex-shrink:0;}
.qty-btn{width:30px;height:30px;border:1px solid #e0e0e0;background:#fff;border-radius:50%;font-size:15px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#555;transition:all .15s;line-height:1;}
.qty-btn:hover:not(:disabled){border-color:#E8572A;color:#E8572A;}
.qty-btn:disabled{opacity:.3;cursor:not-allowed;}
.qty-num{width:36px;text-align:center;font-size:14px;font-weight:500;}
.item-price-col{text-align:right;flex-shrink:0;min-width:90px;}
.item-price{font-size:14px;font-weight:600;color:#222;}
.special-ship{font-size:11px;color:#E8572A;margin-top:2px;}
.del-btn{background:none;border:none;cursor:pointer;color:#E8572A;opacity:.55;padding:5px;border-radius:6px;transition:opacity .15s,background .15s;flex-shrink:0;}
.del-btn:hover{opacity:1;background:#fff0ec;}
.target-section{padding:0 24px 18px 108px;}
.ts-header{display:flex;align-items:center;gap:8px;margin-bottom:10px;}
.ts-title{font-size:13px;font-weight:600;color:#222;}
.ts-hint{font-size:12px;color:#888;}
.req{font-style:normal;color:#E8572A;}
.target-card{border:1px solid #ebebeb;border-radius:10px;margin-bottom:8px;overflow:hidden;}
.target-row{display:flex;align-items:center;gap:10px;padding:12px 16px;cursor:pointer;user-select:none;}
.target-row:hover{background:#fafafa;}
.tgt-label{font-size:13px;font-weight:500;color:#333;}
.tgt-badge{padding:2px 9px;border-radius:20px;font-size:11px;font-weight:600;}
.tgt-badge.pending{background:#E8572A;color:#fff;}
.tgt-badge.filled{background:#e6f9f0;color:#27a163;}
.tgt-arrow{margin-left:auto;transition:transform .2s;color:#bbb;}
.tgt-arrow.open{transform:rotate(180deg);}
.target-body{padding:14px 16px 8px;border-top:1px solid #f0f0f0;}
.tgt-tabs{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:16px;}
.tgt-tab{padding:7px 0;border:1px solid #e0e0e0;background:#fff;border-radius:999px;font-size:12px;color:#555;cursor:pointer;transition:all .15s;}
.tgt-tab.active{border-color:#E8572A;color:#E8572A;font-weight:600;}
.frow{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px;}
.ff{display:flex;flex-direction:column;gap:4px;}
.ff.full{grid-column:1/-1;}
.ff label{font-size:11px;color:#666;font-weight:500;}
.fi{padding:9px 12px;border:1px solid #e0e0e0;border-radius:7px;font-size:13px;color:#333;background:#fff;transition:border-color .2s;}
.fi:focus{outline:none;border-color:#E8572A;}
.fi[readonly]{background:#f8f8f8;color:#555;}
.fi-sel{padding:9px 28px 9px 12px;border:1px solid #e0e0e0;border-radius:7px;font-size:13px;color:#333;background:#fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='7'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23999' stroke-width='1.5' fill='none'/%3E%3C/svg%3E") no-repeat right 8px center;appearance:none;cursor:pointer;}
.fi-sel:focus{outline:none;border-color:#E8572A;}
.fi-sel:disabled{background-color:#f8f8f8;color:#555;}
.tgt-actions{display:flex;justify-content:flex-end;gap:8px;padding:10px 0 4px;}
.btn-save-tgt{padding:8px 20px;background:#E8572A;color:#fff;border:none;border-radius:8px;font-size:13px;cursor:pointer;transition:background .2s;}
.btn-save-tgt:hover{background:#d14a1f;}
.btn-cancel-tgt{padding:8px 20px;background:#fff;color:#555;border:1px solid #ddd;border-radius:8px;font-size:13px;cursor:pointer;}
.btn-cancel-tgt:hover{background:#f5f5f5;}
.temple-footer {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 14px 24px;
  border-top: 1px solid #f0f0f0;
  background: #fafafa;
  font-size: 12px;
}
.tf-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  width: 100%;
}
.tf-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}
.tf-label { color: #888; }
.tf-val { color: #333; font-weight: 500; font-size: 13px; }
.tf-hint { color: #bbb; font-size: 11px; }
.tf-subtotal { color: #E8572A; font-size: 15px; font-weight: 700; }
.ml{margin-left:6px;}
.extra-card{background:#fff;border-radius:16px;padding:22px 26px;margin-bottom:20px;box-shadow:0 1px 6px rgba(0,0,0,.06);display:flex;flex-direction:column;gap:20px;}
.extra-title{font-size:14px;font-weight:600;color:#222;margin-bottom:10px;}
.rl{display:flex;align-items:center;gap:7px;font-size:13px;color:#444;cursor:pointer;margin-bottom:7px;}
.rl input[type="radio"]{accent-color:#E8572A;width:14px;height:14px;}
.rec-card{background:#fff;border-radius:16px;padding:22px 26px;box-shadow:0 1px 6px rgba(0,0,0,.06);}
.rec-title{font-size:17px;font-weight:700;color:#222;margin-bottom:18px;}
.rec-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:12px;}
.rec-item{cursor:pointer;}
.rec-img{width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:8px;margin-bottom:8px;}
.rec-temple{font-size:10px;color:#aaa;margin-bottom:2px;}
.rec-name{font-size:12px;font-weight:600;color:#222;margin-bottom:6px;}
.rec-bottom{display:flex;justify-content:space-between;align-items:center;}
.rec-price{font-size:12px;color:#E8572A;font-weight:600;}
.rec-btn{width:28px;height:28px;background:#E8572A;color:#fff;border:none;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .15s;}
.rec-btn:hover{background:#d14a1f;}
.summary-panel{position:sticky;top:20px;background:#fff;border-radius:16px;padding:22px;box-shadow:0 1px 6px rgba(0,0,0,.06);}
.sp-title{font-size:16px;font-weight:700;color:#222;margin-bottom:18px;}
.sp-row{display:flex;justify-content:space-between;font-size:13px;color:#555;margin-bottom:10px;}
.sp-divider{border:none;border-top:1px solid #f0f0f0;margin:14px 0;}
.sp-total-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;font-size:14px;font-weight:600;color:#222;}
.sp-total{font-size:22px;font-weight:800;color:#E8572A;}
.btn-checkout{width:100%;padding:13px;background:#E8572A;color:#fff;border:none;border-radius:10px;font-size:15px;font-weight:600;cursor:pointer;transition:background .2s;}
.btn-checkout:hover:not(.disabled){background:#d14a1f;}
.btn-checkout.disabled{background:#ccc;cursor:not-allowed;}
.checkout-warn{text-align:center;font-size:11px;color:#E8572A;margin-top:8px;}
</style>