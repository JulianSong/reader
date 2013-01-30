/**
*模板解析显示脚本
*edit by julian plase left it 
*/
/**
*初始化配置信息
*/

var pageSize= new Object();
pageSize.width=1080;
pageSize.height=600;
var MAX_BLOCK_AMOUNT=6;//每页最大区块数量
var pageLength=0;
/**
 * 根据浏览器大小确定页面的显示大小
 */
function setPageSize(windowSize){
	if((navigator.userAgent.match(/iPhone/i)) || (navigator.userAgent.match(/iPod/i))||navigator.userAgent.match(/Android/i)) {
	  pageSize.height=windowSize.height-10-((windowSize.height-10)%20);
    }else{
      pageSize.height=windowSize.height-45-((windowSize.height-45)%20);
    }
	pageSize.height=windowSize.height-45-((windowSize.height-45)%20);
    pageSize.width=windowSize.width-64;
	document.getElementById("content").style.width=pageSize.width+"px";
	document.getElementById("maincontent").style.width=pageSize.width+"px";
	document.getElementById("maincontent").style.height=pageSize.height+"px";
	document.getElementById("pages").style.height=pageSize.height+"px";
}
/**
*获取文章数据
*/
function getDataBind(dataBind){
	return document.getElementById(dataBind);
}
/*
*获得数据信息
*/
function getDataInfo(dataInfo){
	var arr=document.getElementById(dataInfo).innerHTML.replace(/(^\s*)|(\s*$)/g, "").split(",");
	var dataInfo=new Array();
	for(i=0;i<arr.length;i++){
		dataInfo.push(arr[i].split("-"));
		dataInfo[i][0]=parseInt(dataInfo[i][0]);//数据id值
		dataInfo[i][1]=parseInt(dataInfo[i][1]);//数据权重
	}
	return dataInfo;
}
/*
*获得文章分页后分页信息
*/
function getPageInfo(tempJson){
    var arr=document.getElementById("page-info").innerHTML.replace(/(^\s*)|(\s*$)/g,"").split(",");
	var pageInfo=new Array();
	for(i=0;i<arr.length;i++){
		var row=arr[i].split("-");
		var pageData= new Array();
		pageData["temp"]=getTemplate(row.shift(),tempJson);
		pageData["data"]=new Array();
		pageData["data"].push(row.shift());
		pageInfo.push(pageData);
	}
	return pageInfo;
}
/**
*获得浏览器可用显示区域大小
*/
function getBrowserClentSize(){
	var size = new Object();
	size.width=window.innerWidth;
	size.height=window.innerHeight;
	return size;
}
/**
 *解析模板
 * 模板字符串以逗号分隔存储信息。如1,1,1,1,0,0,1,1
 * 第一个数字为模板ID，
 * 第二个为模板中区块的数量，
 * 第三第四个数字为模板宽高比的最小公约数。
 * 之后每四个数字为一组表示模板中每个区块矩阵的起始位置和结束位置
 * @param tepInfoStr 模板字符串
 */
function parsingTemplate(tepInfoStr){
	var templateDate=tepInfoStr.split(",");
	//获得每列的宽度
    var clumWidth = Math.round(pageSize.width/templateDate["2"]);
    var rowHeight = Math.round(pageSize.height/templateDate["3"]);
    //解析出模板每块的位置和大小
    var length = templateDate.length - 4;
    var template = new Array();
	for(i = 4; i <= length;i += 4) {
        //获得每个区块的矩阵坐标
        var block = new Array();
        block["x1"] = templateDate[i];
        block["y1"] = templateDate[i + 1];
        block["x2"] = templateDate[i + 2];
        block["y2"] = templateDate[i + 3];
        //获得区块在父容器中相对位置和大小
        block["left"] = block["x1"] * clumWidth;
        block["top"]  = block["y1"] * rowHeight;
        block["width"]  = (block["x2"] - block["x1"]) * clumWidth;
        block["height"] = (block["y2"] - block["y1"]) * rowHeight;
        //获得区块的倒向（横竖）
        block["follow"]=(block["width"]*0.7 > block["height"])? 1:0;
        //获得区块的权重
        block["weight"]=Math.round(block["width"]*block["height"]/280*0.1);
        //根据区块大小确定区块可放图片的级别
        switch (true)
        {
            case block["weight"]>120:
                 block["imgLevel"]=3;
                 break;
            case block["weight"]>90:
                 block["imgLevel"]=2;
                 break;
            case block["weight"] >30:
                 block["imgLevel"]=1;
                 break;
            default:
                block["imgLevel"]=0;
        }
		template.push(block);
    }
	template=sortBlockByWeight(template);
    return template;
}
/**
 * 显示某个区块
 * @param block 区块信息
 * @param tempBlock  模版信息  
 */
function displayBlock(block,tempBlock){
	/*
	*获得dom元素
	*/
	var  blockDiv=document.getElementById("b_"+block[0]);
	var  blockContent=document.getElementById("bc_"+block[0]);
	var  imgContent=document.getElementById("ic_"+block[0]);
	var  img=document.getElementById("img_"+block[0]);
	var  textContent=document.getElementById("tc_"+block[0]);
	var  text=document.getElementById("t_"+block[0]);
	var ibsc=getImgBlockSizeCollate(tempBlock,img);
	tempBlock=setImgDidplay(tempBlock,img,ibsc);
	/*
	*显示区块
	*/
	blockDiv.style.left=tempBlock["left"]+"px";
	blockDiv.style.top=tempBlock["top"]+"px";
	blockDiv.style.width=(tempBlock["width"]-22)+"px";
	blockDiv.style.height=(tempBlock["height"]-22)+"px";
	/*
	*设置blockContent
	*/
	blockContent.className+=" follow_"+tempBlock["follow"];
	blockContent.className+=" ibsc_"+ibsc;
	blockContent.className+=" img_level_"+tempBlock["imgLevel"];
	blockContent.style.height=(tempBlock["height"]-20)+"px";
	/*
	*设置图片
	*/
	if (tempBlock["follow"] == 0 && tempBlock["imgContentHeight"]!=0) {
		 imgContent.style.height=tempBlock["imgContentHeight"]+"px";
	}
	img.width=tempBlock["imgWidth"]-20;
	img.height=tempBlock["imgHeight"];
	//img.style.marginTop=tempBlock["imgTop"];
	if (tempBlock["follow"] == 1) {
		 img.style.marginLeft=-tempBlock["imgLeft"]+"px";
	} else {
	     img.style.marginBottom=tempBlock["marginBottom"]+"px";
	}
	/*
	*设置文本
	*/
	if (tempBlock["textHeight"] > 0) {
	    textContent.style.height=tempBlock["textHeight"]+"px";
	}
	
    return true;	
}
/**
 *按权重对文章分页
 * @param $articlesinfo 文章信息
 */
function metchTempByWeight(dataInfo,tempJson){
	/**
	* 初始化变量
	*/
	var pages=new Array();
	var i=0;
	var pageInfo=document.getElementById("page-info");
	/**
	*遍历数据信息并分页
	*/
	while(i<dataInfo.length){
		  var blockAmount=0;
	      var tempWeight=0;
		  var pageData= new Array();
		  pageData["data"]=new Array();
		  var info=new String();
		  var totalDw=0;//总文章权重
		  /*
		  *通过权重对数据进行分页
		  */
		  while(i<dataInfo.length&&blockAmount<MAX_BLOCK_AMOUNT&&tempWeight+dataInfo[i][1]<VALVE_WEIGHT){  
            tempWeight+=dataInfo[i][1];    
			pageData["data"].push(dataInfo[i]);
			info+="-"+dataInfo[i][0];
			totalDw+=dataInfo[i][1];
			blockAmount++;
			i++;
          }
		  pageData["data"]=sortDataByWeight(pageData["data"]);
		  var aveDw=Math.round(totalDw/pageData["data"].length);//数据平均权重
		  var temps=getTemplates(pageData["data"].length,tempJson);//获得相应区块数量的模板
		  /*
		  *遍历解析模版，并求出与数据相关系数最大模版
		  */
		  var Rtd=0;//数据模版相关系数初始为0
		  var D=0;//因子
		  var T=0;//因子 
		  var T1=0;
		  var D1=0;
		  var aveTw=Math.round(pageSize.width*pageSize.height/280*0.1/pageData["data"].length);//模版平均权重
		  for(n=0;n<temps.length;n++){
			  var temp=parsingTemplate(temps[n]["pinfo"]);
			  for(m=0;m<temp.length;m++){
				  var difTw=temp[m]["weight"]-aveTw;
				  var difDw=pageData["data"][m][1]-aveDw;
				  T+=difTw*difDw;
				  T1+=Math.pow(difTw,2);
				  D1+=Math.pow(difDw,2);  
			  }
			  D=Math.sqrt(T1)*Math.sqrt(D1,2);
			  var tmpRtd=D!=0?T/D:0;
			  if(tmpRtd > Rtd){
			     Rtd=tmpRtd;
				 pageData["ti"]=temps[n]["ti"];
				 pageData["temp"]=temp;
			  }
			  //因子清0
			  T=0;
			  D=0;
		  }
		  if(Rtd==0){//如果相关性为0则随机取模板
		    var ti=Math.round(Math.random()*(temps.length-1));
		    pageData["ti"]=temps[ti]["ti"];
		    pageData["temp"]=parsingTemplate(temps[ti]["pinfo"]);
		  }
		  pageInfo.innerHTML+=pageData["ti"]+info;
		  if(i!=dataInfo.length)
		  pageInfo.innerHTML+=",";
		  pages.push(pageData);  
	}
	return pages;
}
/**
 * 从模板json数据获得模板信息
 * @param unknown_type $blockAmount
 */
function getTemplates(blockAmount,tempJson){
	var fitTemps=new Array();
	for(i=0;i<tempJson.length;i++){
		if(tempJson[i].ba==blockAmount){
			var temp=new Array();
			temp["ti"]=tempJson[i].ti;
			temp["pinfo"]=tempJson[i].pinfo;
			fitTemps.push(temp);
		}
    }
	return fitTemps;
}
/**
 * 从模板json数据获得模板信息
 * @param  $blockAmount
 */
function getTemplate(ti,tempJson){
	for(i=0;i<tempJson.length;i++){
		if(tempJson[i].ti==ti){
			var temp=new Array();
			temp["ti"]=tempJson[i].ti;
			temp["pinfo"]=tempJson[i].pinfo;
			return temp;
		}
    }
}
/*
 * 显示页面
 * @param $block 区块
 * @param $article 文章
*/
function diplayPages(pages,tempJson,dataBind){
	/*
	*初始化数据
	*/
	var page=new Array();
	
	var pagesDiv=document.getElementById("pages");
	var pageLoading=document.getElementById("page_loading");
	pagesDiv.removeChild(pageLoading);
	var articleList = document.getElementById("article_list");
	/*
	*循环遍历pages并显示页面
	*/
	while(page=pages.shift()){//从数组中取出第一个数据并修改数组下标及长度
	     pageLength++;
	     var pageDiv=document.createElement("div");
		 pageDiv.style.width=pageSize.width+"px";
	     pageDiv.style.height=pageSize.height+"px";
		 pageDiv.className="page";
		 pageDiv.id = "page_" + pageLength;
		 var h3 = document.createElement("h3");
		 var h3a=document.createElement("a");
		 h3a.innerHTML = "P." + pageLength;
		 h3a.href="#";
		 h3.appendChild(h3a);
		 h3.className = "pn";
		(function(pn) {
			$(h3).bind("click", function() {
				toPage(pn);
			});
		})(pageLength);
		articleList.appendChild(h3);
		 var block;
		 var img_count=0;
		 while(block=page["data"].shift()){	
		    img_count++;
			var temp=page["temp"].pop();
			if(img_count>3){
			    temp['imgLevel']=0;
			 }	 
			 if(displayBlock(block,temp)){
				var  blockDiv=document.getElementById("b_"+block[0]);
			    var h4 = document.createElement("h4");
			    h4.innerHTML= document.getElementById("t_"+block[0]).innerHTML;
			    articleList.appendChild(h4);
				pageDiv.appendChild(blockDiv);
			 }
		 }
	     pagesDiv.appendChild(pageDiv);
		 document.getElementById("pagecount").innerHTML=pageLength;
	}
	pagesDiv.appendChild(pageLoading);
}
/**
*窗口改变大小时候重新显示页面
 */
function redisplayPages(event){
	var ws=getBrowserClentSize();
	setPageSize(getBrowserClentSize());
	alert(event.attrChange);
	//alert(ws.width);
}
/**
 * 获得文章图片相对于区块的长宽对比
 * 11图片宽度高度均大于区块宽度高度
 * 10 图片宽度大于区块宽度高度小于区块高度
 * 01 图片宽度小于区块宽度高度大于区块高度
 * 00 图片高度宽度均小于区块宽度高度
 * @param $block 区块
 * @param $article 文章
 */
function getImgBlockSizeCollate (block,img){
	w=block["width"] > img.getAttribute("width") ? "0":"1";
    h=block["height"]> img.getAttribute("height") ? "0":"1";
    return w+h;
}
/**
 * 设置图片的显示大小
 * 区块被分为两类，图片大小与区块的大小的关系共分为四类共八种情况
 * @param $block 区块
 * @param $article 文章
 */
function setImgDidplay(block,img,ibsc){
    w_h=img.getAttribute("width")/img.getAttribute("height");
    blockArea=block["width"]*block["height"];
    imgArea=blockArea*0.618;
	if(img.getAttribute("width")*img.getAttribute("height")==0||img.getAttribute("width")==""||img.getAttribute("height")==""||block["imgLevel"]==0){
		block["imgLevel"]=0;
		block["imgWidth"]= 0;
		block["imgHeight"]= 0;
		block["textHeight"]=block["textHeight"]=block["height"]-(block["height"]%20)-20;
		block["imgTop"]= 0;
		block["imgLeft"]= 0;
		block["imgContentHeight"]=0;
		block["marginBottom"]=getMarginBottom(block["imgHeight"],20);
		return block;
	}
    if(block["follow"]==0){
        if(ibsc=="11"){
            block["imgWidth"]= block["width"];
            block["imgHeight"]= Math.round(block["width"]/w_h);
            block["textHeight"]=block["height"]-block["imgHeight"];
            block["imgTop"]= 0;
            block["imgLeft"]= 0;
        }else if(ibsc=="10"){
            if((Math.pow(block["width"])/w_h)<imgArea){
                block["imgWidth"]= block["width"];
                block["imgHeight"]= Math.round(block["width"]/w_h);
                block["textHeight"]=block["height"]-block["imgHeight"];
                block["imgTop"]= 0;
                block["imgLeft"]= 0;
            }else{
                block["imgWidth"]=  img.getAttribute("width");
                block["imgHeight"]= img.getAttribute("height");
                block["textHeight"]=block["height"]-block["imgHeight"];
                block["imgTop"]= 0;
                block["imgLeft"]=img.getAttribute("height")*0.2;
            }
        }else if(ibsc=="00"){
            block["imgWidth"]= img.getAttribute("width");
            block["imgHeight"]= img.getAttribute("height");
            block["textHeight"]=block["height"]-block["imgHeight"];
            block["imgTop"]= 0;
            block["imgLeft"]= 0;
        }else if(ibsc=="01"){
            if((Math.pow(block["width"])/w_h)<imgArea){
                block["imgWidth"]= block["width"];
                block["imgHeight"]= Math.round(block["width"]/w_h);
                block["textHeight"]=block["height"]-block["imgHeight"];
                block["imgTop"]= 0;
                block["imgLeft"]= 0;
            }else{
                block["imgWidth"]= img.getAttribute("width");
                block["imgHeight"]= img.getAttribute("height");
                block["textHeight"]=block["height"]-block["imgHeight"];
                block["imgTop"]= 0;
                block["imgLeft"]= img.getAttribute("height")*0.1 ;
            }
        }
        if(parseInt(block["imgHeight"])+80>block["height"]){
            block["imgContentHeight"]=block["height"]-80;
        }else{
            block["imgContentHeight"]=0;
        }
        block["marginBottom"]=getMarginBottom(block["imgHeight"],20);
        block["textHeight"]=block["textHeight"]-(block["textHeight"]%20)-20;//是文本显示宽度为20的倍数
    }else{
        if(ibsc=="11"){
            block["imgHeight"]= block["height"]-20;
            block["imgWidth"]= Math.round(block["imgHeight"]*w_h);
            block["textHeight"]=block["height"];
            block["imgTop"]= 0;
            block["imgLeft"]= 0;
        }else if(ibsc=="10"){
            if((Math.pow(block["width"])/w_h)>imgArea){
                block["imgHeight"]= block["height"]-20;
                block["imgWidth"]= Math.round(block["imgHeight"]*w_h);
                block["textHeight"]=block["height"];
                block["imgTop"]= 0;
                block["imgLeft"]= 0;
            }else{
                block["imgHeight"]= block["height"]-20;
                block["imgWidth"]= Math.round(block["imgHeight"]*w_h);
                block["textHeight"]=block["height"];
                block["imgTop"]= 0;
                block["imgLeft"]= 0;
            }
        }else if(ibsc=="01"){
            block["imgHeight"]= block["height"]-20;
            block["imgWidth"]= Math.round(block["imgHeight"]*w_h);
            block["textHeight"]=block["height"];
            block["imgTop"]= 0;
            block["imgLeft"]= 0;
        }else if(ibsc=="00"){
            block["imgHeight"]= block["height"]-20;
            block["imgWidth"]= Math.round(block["imgHeight"]*w_h);
            block["textHeight"]=block["height"];
            block["imgTop"]= 0;
            block["imgLeft"]= 0;
        }
        if(block["imgWidth"]*0.7<block["width"]*0.5){
            block["imgLeft"]=Math.round((block["imgWidth"]-block["width"]*0.5)/3);
        }else{
            block["imgLeft"]=Math.round(block["imgWidth"]*0.3);
        }
        block["textHeight"]=block["height"]-(block["height"]%20)-20;//是文本显示宽度为20的倍数
    }
    return block;
}
/**
 * 图片缩放后获得一个margin值是图片下方的文字不会半行截断
 * @param unknown_type $imgHeight
 * @param unknown_type $submultiple
 */
function getMarginBottom(imgHeight,submultiple){
    mod=imgHeight%submultiple;
    return mod==0?0:submultiple-mod;
}
/**
 * 按权重对数据进行排序
 * @param datas
 * @param  row
 */
function sortDataByWeight(datas){
    var key;
    var t;
    for (j=1;j<datas.length ;j++ )//从数组第二个元素开始遍历。
	{
			key=datas[j];
			t=j-1;
			while (t>=0 &&datas[t][1]>key[1])
			{
			   datas[t+1]=datas[t];
			   datas[t]=key;//如果遍历到的当前元素比其前一个元素大，则互换其位置。
			   t--;
			}
	}
	return datas;
}
/**
 * 按权重对模版大小进行排序
 * @param blocks
 * @param  row
 */
function sortBlockByWeight(blocks){
    var key;
    var t;
    for (j=1;j<blocks.length ;j++ )//从数组第二个元素开始遍历。
	{
			key=blocks[j];
			t=j-1;
			while (t>=0 &&blocks[t]["weight"]>key["weight"])
			{
			   blocks[t+1]=blocks[t];
			   blocks[t]=key;//如果遍历到的当前元素比其前一个元素大，则互换其位置。
			   t--;
			}
	}
	return blocks;
}
/**
*输入数据并显示模版源
*/
function saw(tempJson,windowSize,dataBind,dataInfo){
	setPageSize(windowSize);
	var page=metchTempByWeight(getDataInfo(dataInfo),tempJson);
	diplayPages(page,tempJson,getDataBind(dataBind));
	return pageLength;
}