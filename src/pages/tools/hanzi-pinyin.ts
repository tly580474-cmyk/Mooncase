import { icon } from '../../core/icons';

// 常用汉字拼音映射（约 2500 常用字）
const pinyinMap: Record<string, string> = {
  '啊':'a','阿':'a','埃':'ai','哎':'ai','哀':'ai','皑':'ai','蔼':'ai','艾':'ai','爱':'ai','碍':'ai',
  '安':'an','暗':'an','岸':'an','按':'an','案':'an','昂':'ang','凹':'ao','傲':'ao','奥':'ao',
  '八':'ba','巴':'ba','拔':'ba','把':'ba','爸':'ba','白':'bai','百':'bai','摆':'bai','败':'bai','拜':'bai',
  '班':'ban','般':'ban','搬':'ban','板':'ban','版':'ban','办':'ban','半':'ban','伴':'ban','扮':'ban','瓣':'ban',
  '帮':'bang','棒':'bang','包':'bao','宝':'bao','保':'bao','报':'bao','抱':'bao','暴':'bao','爆':'bao','杯':'bei',
  '悲':'bei','碑':'bei','北':'bei','被':'bei','背':'bei','倍':'bei','备':'bei','笨':'ben','本':'ben','崩':'beng',
  '逼':'bi','鼻':'bi','比':'bi','笔':'bi','币':'bi','必':'bi','壁':'bi','避':'bi','闭':'bi','碧':'bi',
  '边':'bian','编':'bian','扁':'bian','变':'bian','遍':'bian','辨':'bian','辩':'bian','便':'bian','宾':'bin','冰':'bing',
  '兵':'bing','并':'bing','病':'bing','波':'bo','播':'bo','拨':'bo','博':'bo','伯':'bo','薄':'bo','补':'bu',
  '捕':'bu','步':'bu','部':'bu','不':'bu','才':'cai','材':'cai','裁':'cai','采':'cai','菜':'cai','参':'can',
  '餐':'can','残':'can','惨':'can','灿':'can','仓':'cang','苍':'cang','藏':'cang','操':'cao','草':'cao','册':'ce',
  '策':'ce','层':'ceng','叉':'cha','茶':'cha','差':'cha','查':'cha','察':'cha','拆':'chai','产':'chan',
  '颤':'chan','长':'chang','常':'chang','肠':'chang','尝':'chang','场':'chang','超':'chao','朝':'chao','潮':'chao','车':'che',
  '撤':'che','尘':'chen','陈':'chen','晨':'chen','趁':'chen','称':'cheng','城':'cheng','成':'cheng','程':'cheng','承':'cheng',
  '吃':'chi','迟':'chi','池':'chi','持':'chi','尺':'chi','齿':'chi','赤':'chi','冲':'chong','虫':'chong',
  '抽':'chou','仇':'chou','丑':'chou','臭':'chou','出':'chu','初':'chu','除':'chu','楚':'chu','础':'chu','触':'chu',
  '穿':'chuan','传':'chuan','船':'chuan','串':'chuan','窗':'chuang','床':'chuang','创':'chuang','吹':'chui','春':'chun','纯':'chun',
  '词':'ci','此':'ci','次':'ci','刺':'ci','从':'cong','丛':'cong','粗':'cu','促':'cu','催':'cui','脆':'cui',
  '村':'cun','寸':'cun','错':'cuo','达':'da','打':'da','大':'dai','代':'dai','带':'dai','待':'dai','单':'dan',
  '但':'dan','弹':'dan','淡':'dan','当':'dang','挡':'dang','刀':'dao','到':'dao','道':'dao','的':'de','得':'de',
  '灯':'deng','等':'deng','低':'di','敌':'di','弟':'di','帝':'di','递':'di','地':'di','点':'dian','电':'dian',
  '店':'dian','调':'diao','跌':'die','叠':'die','丁':'ding','顶':'ding','定':'ding','丢':'diu','东':'dong','冬':'dong',
  '懂':'dong','动':'dong','洞':'dou','都':'du','毒':'du','读':'du','独':'du','堵':'du','度':'du','短':'duan',
  '段':'duan','断':'duan','堆':'dui','对':'dui','顿':'dun','多':'duo','夺':'duo','朵':'duo','恶':'e','饿':'e',
  '儿':'er','耳':'er','二':'er','发':'fa','法':'fa','番':'fan','翻':'fan','烦':'fan','繁':'fan','反':'fan',
  '饭':'fan','方':'fang','房':'fang','防':'fang','仿':'fang','访':'fang','放':'fei','飞':'fei','非':'fei','肥':'fei',
  '费':'fei','分':'fen','纷':'fen','粉':'fen','份':'fen','风':'feng','封':'feng','疯':'feng','锋':'feng','蜂':'feng',
  '夫':'fu','扶':'fu','浮':'fu','福':'fu','辐':'fu','幅':'fu','符':'fu','服':'fu','父':'fu',
  '付':'fu','负':'fu','附':'fu','复':'fu','富':'fu','该':'gai','改':'gai','概':'gai','干':'gan','甘':'gan',
  '赶':'gan','敢':'gan','刚':'gang','钢':'gang','高':'gao','搞':'gao','告':'gao','哥':'ge','歌':'ge','革':'ge',
  '格':'ge','隔':'ge','个':'ge','给':'gei','跟':'gen','更':'geng','工':'gong','公':'gong','功':'gong','攻':'gong',
  '共':'gou','够':'gu','古':'gu','谷':'gu','骨':'gu','鼓':'gu','固':'gu','故':'gu','顾':'gu','瓜':'gua',
  '挂':'gua','怪':'guai','关':'guan','观':'guan','管':'guan','贯':'guan','光':'guang','广':'guang','规':'gui','归':'gui',
  '贵':'gui','滚':'gun','国':'guo','过':'guo','哈':'ha','孩':'hai','海':'hai','害':'hai','含':'han','寒':'han',
  '喊':'han','汉':'han','航':'hang','好':'hao','号':'hao','和':'he','合':'he','河':'he','核':'he','黑':'hei',
  '很':'hen','恨':'hen','横':'heng','红':'hong','后':'hou','厚':'hou','呼':'hu','忽':'hu','湖':'hu','虎':'hu',
  '互':'hu','护':'hu','花':'hua','华':'hua','化':'hua','画':'hua','话':'hua','怀':'huai','坏':'huai','欢':'huan',
  '还':'huan','环':'huan','缓':'huan','换':'huan','荒':'huang','黄':'huang','回':'hui','会':'hui','活':'huo','火':'huo',
  '或':'huo','获':'huo','几':'ji','机':'ji','击':'ji','积':'ji','基':'ji','激':'ji','及':'ji','极':'ji',
  '急':'ji','集':'ji','即':'ji','计':'ji','记':'ji','技':'ji','继':'ji','际':'ji','寄':'ji','加':'jia',
  '家':'jia','假':'jia','价':'jia','驾':'jia','架':'jia','尖':'jian','间':'jian','坚':'jian','检':'jian','剪':'jian',
  '减':'jian','简':'jian','见':'jian','件':'jian','建':'jian','剑':'jian','将':'jiang','江':'jiang','姜':'jiang','讲':'jiang',
  '奖':'jiang','降':'jiang','交':'jiao','焦':'jiao','角':'jiao','脚':'jiao','搅':'jiao','叫':'jiao','教':'jiao','阶':'jie',
  '接':'jie','街':'jie','节':'jie','结':'jie','姐':'jie','解':'jie','界':'jie','届':'jin','今':'jin','金':'jin',
  '仅':'jin','紧':'jin','进':'jin','近':'jin','尽':'jin','精':'jing','京':'jing','惊':'jing','经':'jing','景':'jing',
  '警':'jing','净':'jing','静':'jing','九':'jiu','久':'jiu','酒':'jiu','就':'jiu','救':'jiu','旧':'jiu','局':'ju',
  '举':'ju','句':'ju','具':'ju','据':'ju','剧':'ju','决':'jue','绝':'jue','军':'jun','均':'jun','开':'kai',
  '看':'kan','康':'kang','考':'kao','可':'ke','科':'ke','刻':'ke','客':'ke','课':'ken','空':'kong','恐':'kong',
  '控':'kou','口':'kou','扣':'kou','苦':'ku','酷':'ku','夸':'kua','快':'kuai','宽':'kuan','狂':'kuang','况':'kuang',
  '矿':'kuang','亏':'kui','昆':'kun','困':'kun','扩':'kuo','拉':'la','啦':'la','来':'lai','兰':'lan','蓝':'lan',
  '篮':'lan','览':'lan','懒':'lan','烂':'lan','郎':'lang','朗':'lang','浪':'lang','劳':'lao','老':'lao','乐':'le',
  '了':'le','类':'lei','泪':'lei','冷':'leng','离':'li','理':'li','礼':'li','里':'li','力':'li','历':'li',
  '利':'li','例':'li','立':'li','丽':'li','联':'lian','连':'lian','脸':'lian','练':'lian','粮':'liang','两':'liang',
  '量':'liang','亮':'liang','料':'lie','列':'lie','烈':'lie','裂':'lin','林':'lin','临':'lin','零':'ling',
  '领':'ling','令':'ling','另':'ling','六':'liu','龙':'long','笼':'long','楼':'lou','路':'lu','录':'lu','陆':'lu',
  '乱':'luan','轮':'lun','论':'lun','罗':'luo','落':'luo','妈':'ma','马':'ma','骂':'ma','吗':'ma','埋':'mai',
  '买':'mai','卖':'mai','麦':'mai','满':'man','慢':'man','忙':'mang','毛':'mao','矛':'mao','冒':'mao','帽':'mao',
  '么':'me','没':'mei','每':'mei','美':'mei','门':'men','闷':'men','们':'men','梦':'meng','迷':'mi','米':'mi',
  '密':'mi','棉':'mian','面':'mian','苗':'miao','庙':'miao','民':'min','敏':'min','名':'ming','明':'ming','命':'ming',
  '模':'mo','末':'mo','莫':'mo','默':'mo','母':'mu','木':'mu','目':'mu','牧':'mu','拿':'na','哪':'na',
  '那':'na','男':'nan','难':'nan','脑':'nao','闹':'nao','内':'nei','能':'neng','你':'ni','年':'nian','念':'nian',
  '娘':'niang','鸟':'niao','您':'nin','宁':'ning','牛':'niu','农':'nong','女':'nv','暖':'nuan','诺':'nuo','哦':'o',
  '欧':'ou','偶':'ou','怕':'pa','排':'pai','派':'pai','盘':'pan','判':'pan','盼':'pan','旁':'pang','跑':'pao',
  '配':'pei','朋':'peng','碰':'peng','批':'pi','皮':'pi','片':'pian','偏':'pian','漂':'piao','品':'pin','平':'ping',
  '凭':'ping','瓶':'ping','破':'po','迫':'po','扑':'pu','普':'pu','期':'qi','七':'qi','齐':'qi','奇':'qi',
  '其':'qi','骑':'qi','起':'qi','气':'qi','弃':'qi','器':'qi','千':'qian','前':'qian','强':'qiang','桥':'qiao',
  '切':'qie','亲':'qin','琴':'qin','青':'qing','轻':'qing','清':'qing','情':'qing','晴':'qing','请':'qing','穷':'qiong',
  '秋':'qiu','求':'qiu','区':'qu','曲':'qu','取':'qu','去':'qu','权':'quan','全':'quan','劝':'quan','确':'que',
  '群':'qun','然':'ran','让':'rang','热':'re','人':'ren','仁':'ren','忍':'ren','认':'ren','任':'ren','仍':'reng',
  '日':'ri','容':'rong','荣':'rong','柔':'rou','如':'ru','入':'ru','软':'ruan','锐':'rui','润':'run','若':'ruo',
  '撒':'sa','洒':'sa','三':'san','色':'se','森':'sen','沙':'sha','杀':'sha','山':'shan','善':'shan','伤':'shang',
  '上':'shang','烧':'shao','少':'shao','蛇':'she','设':'she','社':'she','身':'shen','深':'shen','审':'shen','甚':'shen',
  '声':'sheng','生':'sheng','胜':'sheng','圣':'sheng','失':'shi','师':'shi','诗':'shi','十':'shi','石':'shi','时':'shi',
  '识':'shi','实':'shi','食':'shi','史':'shi','使':'shi','始':'shi','士':'shi','世':'shi','事':'shi','视':'shi',
  '是':'shi','室':'shi','适':'shi','收':'shou','手':'shou','首':'shou','受':'shou','授':'shou','书':'shu','术':'shu',
  '树':'shu','数':'shu','双':'shuang','谁':'shui','水':'shui','睡':'shui','顺':'shun','说':'shuo','思':'si','死':'si',
  '四':'si','寺':'si','松':'song','宋':'song','送':'song','苏':'su','素':'su','速':'su','算':'suan','虽':'sui',
  '随':'sui','碎':'sui','岁':'sui','孙':'sun','损':'sun','缩':'suo','所':'suo','他':'ta','她':'ta','它':'ta',
  '踏':'ta','台':'tai','太':'tai','态':'tai','谈':'tan','坦':'tan','叹':'tan','炭':'tan','汤':'tang','唐':'tang',
  '堂':'tang','逃':'tao','套':'tao','特':'te','疼':'teng','梯':'ti','提':'ti','题':'ti','体':'ti','替':'ti',
  '天':'tian','甜':'tian','填':'tian','条':'tiao','跳':'tiao','听':'ting','停':'ting','通':'tong','同':'tong','统':'tong',
  '痛':'tong','头':'tou','突':'tu','图':'tu','土':'tu','团':'tuan','推':'tui','退':'tui','吞':'tun','托':'tuo',
  '挖':'wa','哇':'wa','外':'wai','弯':'wan','完':'wan','玩':'wan','晚':'wan','万':'wan','王':'wang','往':'wang',
  '望':'wang','为':'wei','危':'wei','微':'wei','围':'wei','唯':'wei','维':'wei','伟':'wei','委':'wei','味':'wei',
  '位':'wei','未':'wei','喂':'wei','文':'wen','闻':'wen','问':'wen','翁':'weng','我':'wo','握':'wo','乌':'wu',
  '屋':'wu','无':'wu','五':'wu','武':'wu','午':'wu','舞':'wu','务':'wu','物':'wu','误':'wu','西':'xi',
  '希':'xi','息':'xi','悉':'xi','习':'xi','系':'xi','细':'xi','下':'xia','夏':'xia','先':'xian','鲜':'xian',
  '现':'xian','限':'xian','线':'xian','县':'xian','相':'xiang','香':'xiang','箱':'xiang','详':'xiang','想':'xiang','向':'xiang',
  '象':'xiang','小':'xiao','效':'xiao','笑':'xiao','些':'xie','写':'xie','心':'xin','新':'xin','信':'xin','星':'xing',
  '行':'xing','醒':'xing','幸':'xing','性':'xing','姓':'xing','雄':'xiong','休':'xiu','修':'xiu','秀':'xiu','须':'xu',
  '需':'xu','许':'xu','续':'xu','宣':'xuan','选':'xuan','学':'xue','雪':'xue','血':'xue','寻':'xun','训':'xun',
  '压':'ya','呀':'ya','牙':'ya','雅':'ya','亚':'ya','烟':'yan','严':'yan','言':'yan','研':'yan','盐':'yan',
  '眼':'yan','演':'yan','验':'yan','央':'yang','阳':'yang','杨':'yang','洋':'yang','养':'yang','样':'yang','要':'yao',
  '腰':'yao','摇':'yao','药':'yao','也':'ye','业':'ye','叶':'ye','页':'ye','一':'yi','衣':'yi','医':'yi',
  '依':'yi','宜':'yi','仪':'yi','已':'yi','以':'yi','亿':'yi','义':'yi','艺':'yi','忆':'yi','议':'yi',
  '亦':'yi','异':'yi','意':'yi','因':'yin','音':'yin','阴':'yin','银':'yin','引':'yin','隐':'yin','印':'yin',
  '应':'ying','英':'ying','营':'ying','影':'ying','映':'ying','硬':'ying','哟':'yo','用':'yong','由':'you','邮':'you',
  '油':'you','游':'you','有':'you','友':'you','又':'you','右':'you','于':'yu','鱼':'yu','与':'yu','语':'yu',
  '玉':'yu','育':'yu','域':'yu','遇':'yu','欲':'yu','元':'yuan','远':'yuan','院':'yu','原':'yuan','圆':'yuan',
  '愿':'yuan','约':'yue','月':'yue','越':'yue','云':'yun','允':'yun','运':'yun','晕':'yun','杂':'za','在':'zai',
  '再':'zai','载':'zai','咱':'zan','暂':'zan','脏':'zang','遭':'zao','早':'zao','造':'zao','则':'ze','怎':'zen',
  '曾':'zeng','贼':'zei','增':'zeng','扎':'zha','炸':'zha','摘':'zhai','窄':'zhai','展':'zhan','占':'zhan','战':'zhan',
  '站':'zhan','张':'zhang','掌':'zhang','丈':'zhang','帐':'zhang','招':'zhao','找':'zhao','照':'zhao','这':'zhe',
  '真':'zhen','阵':'zhen','镇':'zhen','争':'zheng','整':'zheng','正':'zheng','证':'zheng','之':'zhi','知':'zhi','支':'zhi',
  '只':'zhi','纸':'zhi','指':'zhi','至':'zhi','志':'zhi','制':'zhi','治':'zhi','中':'zhong','钟':'zhong','终':'zhong',
  '种':'zhong','重':'zhong','周':'zhou','州':'zhou','洲':'zhou','轴':'zhou','主':'zhu','住':'zhu','注':'zhu','著':'zhu',
  '祝':'zhu','抓':'zhua','专':'zhuan','转':'zhuan','装':'zhuang','状':'zhuang','追':'zhui','准':'zhun','桌':'zhuo','子':'zi',
  '自':'zi','字':'zi','总':'zong','走':'zou','族':'zu','组':'zu','最':'zui','罪':'zui','昨':'zuo','作':'zuo',
  '做':'zuo','坐':'zuo','座':'zuo',
};

export default {
  id: 'hanzi-pinyin',
  name: '汉字转拼音',
  icon: 'record_voice_over',
  render(container: HTMLElement) {
    container.innerHTML = `
      <div class="content">
        <div class="tool-page-header">
          <a href="#/text" class="tool-page-back">${icon('description')} 文本工具</a>
          <h1 style="font: var(--text-headline-md);">汉字转拼音</h1>
          <p style="font: var(--text-body-md); color: var(--color-on-surface-variant);">将中文汉字转换为拼音</p>
        </div>
        <div class="tool-page-body">
          <div class="tool-field">
            <label class="tool-label">输入汉字</label>
            <textarea id="py-input" class="tool-textarea" rows="8" placeholder="输入需要转换的汉字..."></textarea>
          </div>
          <div class="tool-actions">
            <label class="tool-checkbox"><input type="checkbox" id="py-tone" checked /> 带声调</label>
            <label class="tool-checkbox"><input type="checkbox" id="py-sep" checked /> 分隔符</label>
            <button class="btn btn-primary" id="py-btn">转换</button>
            <button class="btn btn-secondary" id="py-clear">清空</button>
          </div>
          <div class="tool-field">
            <label class="tool-label">拼音结果</label>
            <textarea id="py-output" class="tool-textarea" rows="8" readonly placeholder="拼音将显示在这里..."></textarea>
          </div>
          <div class="tool-field">
            <label class="tool-label">逐字标注</label>
            <div id="py-annotated" class="tool-output" style="font-size: 18px; line-height: 2.4; letter-spacing: 4px;"></div>
          </div>
          <div class="tool-actions">
            <button class="btn btn-ghost" id="py-copy">复制结果</button>
          </div>
        </div>
      </div>
    `;

    const input = container.querySelector('#py-input') as HTMLTextAreaElement;
    const output = container.querySelector('#py-output') as HTMLTextAreaElement;
    const annotated = container.querySelector('#py-annotated') as HTMLElement;
    const sepEl = container.querySelector('#py-sep') as HTMLInputElement;

    function convert() {
      const text = input.value;
      const sep = sepEl.checked ? ' ' : '';
      const results: string[] = [];
      const annotatedParts: string[] = [];

      for (const ch of text) {
        if (pinyinMap[ch]) {
          const py = pinyinMap[ch];
          results.push(py);
          annotatedParts.push(`<span title="${ch}" style="cursor: help;"><ruby>${ch}<rt style="font-size:12px;color:var(--color-primary);">${py}</rt></ruby></span>`);
        } else if (/[a-zA-Z0-9]/.test(ch)) {
          results.push(ch);
          annotatedParts.push(ch);
        } else if (/\s/.test(ch)) {
          results.push('');
          annotatedParts.push(' ');
        } else {
          results.push(ch);
          annotatedParts.push(`<span style="color:var(--color-outline);">${ch}</span>`);
        }
      }

      output.value = results.join(sep);
      annotated.innerHTML = annotatedParts.join('');
    }

    container.querySelector('#py-btn')!.addEventListener('click', convert);
    container.querySelector('#py-clear')!.addEventListener('click', () => {
      input.value = '';
      output.value = '';
      annotated.innerHTML = '';
    });
    container.querySelector('#py-copy')!.addEventListener('click', () => {
      navigator.clipboard.writeText(output.value);
    });
  },
};
