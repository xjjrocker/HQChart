/*
   Copyright (c) 2018 jones
 
    http://www.apache.org/licenses/LICENSE-2.0

   开源项目 https://github.com/jones2000/HQChart
 
   jones_2000@163.com

   封装股票列表控件 (H5版本)
   不提供内置测试数据
*/

function JSReportChart(divElement)
{
    this.DivElement=divElement;
    this.JSChartContainer;              //表格控件

     //h5 canvas
     this.CanvasElement=document.createElement("canvas");
     this.CanvasElement.className='jsreportlist-drawing';
     this.CanvasElement.id=Guid();
     this.CanvasElement.setAttribute("tabindex",0);
     if (this.CanvasElement.style) this.CanvasElement.style.outline='none';
     if(divElement.hasChildNodes())
     {
         JSConsole.Chart.Log("[JSReportChart::JSReportChart] divElement hasChildNodes", divElement.childNodes);
     }
     divElement.appendChild(this.CanvasElement);


    this.OnSize=function()
    {
        //画布大小通过div获取
        var height=parseInt(this.DivElement.style.height.replace("px",""));
        this.CanvasElement.height=height;
        this.CanvasElement.width=parseInt(this.DivElement.style.width.replace("px",""));
        this.CanvasElement.style.width=this.CanvasElement.width+'px';
        this.CanvasElement.style.height=this.CanvasElement.height+'px';

        var pixelTatio = GetDevicePixelRatio(); //获取设备的分辨率
        this.CanvasElement.height*=pixelTatio;
        this.CanvasElement.width*=pixelTatio;

        JSConsole.Chart.Log(`[JSReportChart::OnSize] devicePixelRatio=${window.devicePixelRatio}, height=${this.CanvasElement.height}, width=${this.CanvasElement.width}`);

        if (this.JSChartContainer && this.JSChartContainer.OnSize)
        {
            this.JSChartContainer.OnSize();
        } 
    }

    this.SetOption=function(option)
    {
        var chart=this.CreateJSReportChartContainer(option);

        if (!chart) return false;

        if (option.OnCreatedCallback) option.OnCreatedCallback(chart);

        this.JSChartContainer=chart;
        this.DivElement.JSChart=this;   //div中保存一份

        if (option.Symbol) chart.Symbol=option.Symbol;
        if (option.Name) chart.Name=option.Name;

        var requestOption={ Callback:null };
        if (chart.Symbol) requestOption.Callback=function(){ chart.RequestMemberListData(); };

        chart.RequestStockListData(requestOption);   //下载码表     
    }

    this.CreateJSReportChartContainer=function(option)
    {
        var chart=new JSReportChartContainer(this.CanvasElement);
        chart.Create(option);

        if (option.NetworkFilter) chart.NetworkFilter=option.NetworkFilter;
        if (IFrameSplitOperator.IsNonEmptyArray(option.Column))  chart.SetColumn(option.Column);
        if (IFrameSplitOperator.IsNonEmptyArray(option.Tab)) chart.SetTab(option.Tab);
        if (IFrameSplitOperator.IsNumber(option.TabSelected)) chart.SetSelectedTab(option.TabSelected);
        if (IFrameSplitOperator.IsBool(option.EnableDragRow)) chart.EnableDragRow=option.EnableDragRow;
        if (IFrameSplitOperator.IsNumber(option.DragRowType)) chart.DragRowType=option.DragRowType;
        if (option.SortInfo)
        {
            var item=option.SortInfo;
            if (IFrameSplitOperator.IsNumber(item.Field)) chart.SortInfo.Field=item.Field;
            if (IFrameSplitOperator.IsNumber(item.Sort)) chart.SortInfo.Sort=item.Sort;
        }

        this.SetChartBorder(chart, option);

        //是否自动更新
        if (option.IsAutoUpdate!=null) chart.IsAutoUpdate=option.IsAutoUpdate;
        if (option.AutoUpdateFrequency>0) chart.AutoUpdateFrequency=option.AutoUpdateFrequency;
        if (IFrameSplitOperator.IsBool(option.EnableFilter)) chart.EnableFilter=option.EnableFilter;

        //注册事件
        if (option.EventCallback)
        {
            for(var i=0;i<option.EventCallback.length;++i)
            {
                var item=option.EventCallback[i];
                chart.AddEventCallback(item);
            }
        }

        return chart;
    }

    this.SetChartBorder=function(chart, option)
    {
        if (!option.Border) return;

        var item=option.Border;
        if (IFrameSplitOperator.IsNumber(option.Border.Left)) chart.Frame.ChartBorder.Left=option.Border.Left;
        if (IFrameSplitOperator.IsNumber(option.Border.Right)) chart.Frame.ChartBorder.Right=option.Border.Right;
        if (IFrameSplitOperator.IsNumber(option.Border.Top)) chart.Frame.ChartBorder.Top=option.Border.Top;
        if (IFrameSplitOperator.IsNumber(option.Border.Bottom)) chart.Frame.ChartBorder.Bottom=option.Border.Bottom;

        var pixelTatio = GetDevicePixelRatio(); //获取设备的分辨率
        chart.Frame.ChartBorder.Left*=pixelTatio;
        chart.Frame.ChartBorder.Right*=pixelTatio;
        chart.Frame.ChartBorder.Top*=pixelTatio;
        chart.Frame.ChartBorder.Bottom*=pixelTatio;
    }

    /////////////////////////////////////////////////////////////////////////////
    //对外接口
    
    //切换股票代码接口
    this.ChangeSymbol=function(symbol, option)
    {
        if (this.JSChartContainer) this.JSChartContainer.ChangeSymbol(symbol,option);
    }

    this.SetColumn=function(aryColumn, option)
    {
        if (this.JSChartContainer) this.JSChartContainer.SetColumn(aryColumn,option);
    }

    this.EnableFilter=function(bEnable, option) //启动|关闭筛选
    {
        if (this.JSChartContainer) this.JSChartContainer.EnableFilter(bEnable, option);
    }

    //事件回调
    this.AddEventCallback=function(obj)
    {
        if(this.JSChartContainer && typeof(this.JSChartContainer.AddEventCallback)=='function')
        {
            JSConsole.Chart.Log('[JSReportChart:AddEventCallback] obj=', obj);
            this.JSChartContainer.AddEventCallback(obj);
        }
    }

    //重新加载配置
    this.ReloadResource=function(option)
    {
        if(this.JSChartContainer && typeof(this.JSChartContainer.ReloadResource)=='function')
        {
            JSConsole.Chart.Log('[JSReportChart:ReloadResource] ');
            this.JSChartContainer.ReloadResource(option);
        }
    }

    this.ChartDestory=function()
    {
        if (this.JSChartContainer && typeof (this.JSChartContainer.ChartDestory) == 'function') 
        {
            this.JSChartContainer.ChartDestory();
        }
    }

    this.Draw=function()
    {
        if(this.JSChartContainer && typeof(this.JSChartContainer.Draw)=='function')
        {
            JSConsole.Chart.Log('[JSReportChart:Draw] ');
            this.JSChartContainer.Draw();
        }
    }
}


JSReportChart.Init=function(divElement)
{
    var jsChartControl=new JSReportChart(divElement);
    jsChartControl.OnSize();

    return jsChartControl;
}

//自定义风格
JSReportChart.SetStyle=function(option)
{
    if (option) g_JSChartResource.SetStyle(option);
}

//获取颜色配置 (设置配必须啊在JSChart.Init()之前)
JSReportChart.GetResource=function()  
{
    return g_JSChartResource;
}

function HQReportItem()
{
    this.OriginalSymbol;    //原始代码
    this.Symbol;
    this.Name;
    this.YClose;
    this.Open;
    this.Price;
    this.High;
    this.Low;
    this.Amount;
    this.Vol;

    this.Increase;      //涨幅
    this.UpDown;        //涨跌
    this.Exchange;      //换手
    this.Amplitude;     //振幅

    this.BuyPrice;      //买价/量
    this.BuyVol;
    this.SellPrice;     //卖价/量
    this.SellVol;

    this.AvPrice;   //均价

    this.LimitHigh;       //涨停价
    this.LimitLow;        //跌停价

    this.VolIn;         //内盘
    this.VolOut;        //外盘

    this.DealNum;       //现量

    this.OutShares;     //流通股本
    this.TotalShares;   //总股本
    this.MarketValue;   //总市值
    this.CircMarketValue;//流通市值

    this.ExtendData;    //扩展数据
}

function JSReportChartContainer(uielement)
{
    this.ClassName='JSReportChartContainer';
    this.Frame;                                     //框架画法
    this.ChartPaint=[];                             //图形画法
    this.ChartSplashPaint=null;                     //等待提示
    this.LoadDataSplashTitle="数据加载中";           //下载数据提示信息

    this.SplashTitle={ StockList:"下载码表中.....", MemberList:"下载成分中....." } ;

    this.Canvas=uielement.getContext("2d");         //画布
    this.ShowCanvas=null;

    this.Symbol;    //板块代码
    this.Name;      //板块名称
    this.NetworkFilter;                                 //数据回调接口
    this.Data={ XOffset:0, YOffset:0, Data:[] };        //股票列表
    this.SourceData={ Data:[] } ;                       //原始股票顺序(排序还原用)
    this.BlockData=new Map();                           //当前板块数据
    this.MapStockData=new Map();                        //原始股票数据
    this.FixedRowData={ Data:[], Type:0, Symbol:[] };              //顶部固定行Data:[{ Value:, Text:, Color:, TextAgiln: }], Type:0=自定义数据, 1 =(股票数据) Symbol:[],

    //this.FixedRowData.Data=[ [null, {Value:11, Text:"11" }], [null, null, null, {Value:12, Text:"ddddd", Color:"rgb(45,200,4)"}]];

    this.SortInfo={ Field:-1, Sort:0 };                //排序信息 {Field:排序字段id, Sort:0 不排序 1升序 2降序 }

    //行拖拽
    this.DragRow;
    this.EnableDragRow=false;
    this.DragRowType=0; //0=插入  1=交换
    this.AutoDragScrollTimer=null;
    this.EnablePageScroll=false;
    this.DragMove;  //={ Click:{ 点击的点}, Move:{最后移动的点}, PreMove:{上一个点的位置} };

    //事件回调
    this.mapEvent=new Map();   //通知外部调用 key:JSCHART_EVENT_ID value:{Callback:回调,}

    this.AutoUpdateTimer=null;
    this.AutoUpdateFrequency=15000;             //15秒更新一次数据

    this.DelayUpdateTimer=null;     //延迟更新
    this.DelayUpdateFrequency=500;  //延迟更新时间
    
    this.UIElement=uielement;
    this.LastPoint=new Point();     //鼠标位置
    this.IsOnTouch=false;
    this.TouchDrag;
    this.TouchMoveMinAngle=70;          //左右移动最小角度
    this.YStepPixel=5*GetDevicePixelRatio();
    this.XStepPixel=10*GetDevicePixelRatio();   
    
    this.PageUpDownCycle=true;  //翻页循环
    this.DragPageCycle=true;    //手机翻页循环

    //拖拽滚动条
    this.DragXScroll=null;  //{Start:{x,y}, End:{x, y}}

    this.IsDestroy=false;        //是否已经销毁了

    this.ChartDestory=function()    //销毁
    {
        this.IsDestroy=true;
        this.StopAutoUpdate();
    }

    this.StopAutoDragScrollTimer=function()
    {
        JSConsole.Chart.Log("[JSReportChartContainer::StopAutoDragScrollTimer] stop ");
        this.EnablePageScroll=false;
        if (this.AutoDragScrollTimer!=null) 
        {
            clearTimeout(this.AutoDragScrollTimer);
            this.AutoDragScrollTimer = null;
        }
    }

    this.AutoScrollPage=function(step)
    {
        this.AutoDragScrollTimer=setTimeout(() =>
        {
            this.ChartOperator_Temp_ScrollPage(step);
        },300);
    }

    this.ChartOperator_Temp_ScrollPage=function(moveSetp)
    {
        if (!this.EnablePageScroll) return;
        var reportChart=this.GetReportChart() 
        if (!reportChart) return;

        if (moveSetp>0)
        {
            var pageStatus=reportChart.GetCurrentPageStatus();
            if (pageStatus.IsEnd) return;

            this.MoveYOffset(moveSetp, false);
            ++moveSetp;
        }
        else if (moveSetp<0)
        {
            if (this.Data.YOffset<=0) return;

            this.MoveYOffset(moveSetp, false);
            --moveSetp;
        }
        else
        {
            return;
        }

        this.Draw();

        if (!this.EnablePageScroll) return;

        this.AutoScrollPage(moveSetp);

        return;
    }


    //清空固定行数据
    this.ClearFixedRowData=function()
    {
        this.FixedRowData.Data=[];
        this.FixedRowData.Symbol=[];
    }

    //设置固定行
    this.SetFixedRowCount=function(value)
    {
        var chart=this.GetReportChart();
        if (!chart) return;

        chart.FixedRowCount=value;
    }

    //创建
    this.Create=function(option)
    {
        this.UIElement.JSChartContainer=this;

        //创建等待提示
        this.ChartSplashPaint = new ChartSplashPaint();
        this.ChartSplashPaint.Canvas = this.Canvas;
        this.ChartSplashPaint.SetTitle(this.LoadDataSplashTitle);
        this.ChartSplashPaint.IsEnableSplash=true;

        //创建框架
        this.Frame=new JSReportFrame();
        this.Frame.ChartBorder=new ChartBorder();
        this.Frame.ChartBorder.UIElement=this.UIElement;
        this.Frame.ChartBorder.Top=30;
        this.Frame.ChartBorder.Left=5;
        this.Frame.ChartBorder.Bottom=20;
        this.Frame.Canvas=this.Canvas;

        this.ChartSplashPaint.Frame = this.Frame;

        //创建表格
        var chart=new ChartReport();
        chart.Frame=this.Frame;
        chart.ChartBorder=this.Frame.ChartBorder;
        chart.Canvas=this.Canvas;
        chart.UIElement=this.UIElement;
        chart.GetEventCallback=(id)=> { return this.GetEventCallback(id); }
        chart.GetStockDataCallback=(symbol)=>{ return this.GetStockData(symbol);}
        chart.GetBlockDataCallback=(symbol)=>{ return this.GetBlockData(symbol);}
        chart.Data=this.Data;
        chart.FixedRowData=this.FixedRowData;
        chart.SortInfo=this.SortInfo;
        chart.Tab=new ChartReportTab();
        chart.Tab.Frame=this.Frame;
        chart.Tab.Canvas=this.Canvas;
        chart.Tab.ChartBorder=this.Frame.ChartBorder;
        chart.Tab.Report=chart;
        this.ChartPaint[0]=chart;

        //页脚
        if (option && option.PageInfo===true)
        {
            var pageInfoChart=new ChartReportPageInfo();
            pageInfoChart.Frame=this.Frame;
            pageInfoChart.ChartBorder=this.Frame.ChartBorder;
            pageInfoChart.Canvas=this.Canvas;
            pageInfoChart.Report=chart;
            this.ChartPaint[1]=pageInfoChart;
        }
        
        if (option)
        {
            if (IFrameSplitOperator.IsBool(option.IsShowHeader)) chart.IsShowHeader=option.IsShowHeader;    //是否显示表头
            if (IFrameSplitOperator.IsNumber(option.FixedColumn)) chart.FixedColumn=option.FixedColumn;     //固定列

            if (IFrameSplitOperator.IsNumber(option.BorderLine)) this.Frame.BorderLine=option.BorderLine;   //边框
            if (IFrameSplitOperator.IsBool(option.TabShow)) chart.Tab.IsShow=option.TabShow;
            if (IFrameSplitOperator.IsNumber(option.FixedRowCount)) chart.FixedRowCount=option.FixedRowCount;   //固定行
            if (IFrameSplitOperator.IsBool(option.ItemBorder)) chart.IsDrawBorder=option.ItemBorder;            //单元格边框
            if (IFrameSplitOperator.IsNumber(option.SelectedModel)) chart.SelectedModel=option.SelectedModel;

            if (IFrameSplitOperator.IsNonEmptyArray(option.FixedSymbol))
            {
                chart.FixedRowCount=0;
                this.FixedRowData.Type=1;
                this.FixedRowData.Symbol=[];
                var aryData=option.FixedSymbol;
                for(var i=0; i<aryData.length; ++i)
                {
                    var item=aryData[i];
                    this.FixedRowData.Symbol.push(item.Symbol);
                    ++chart.FixedRowCount;
                }
            }
        }

        var bRegisterKeydown=true;
        var bRegisterWheel=true;

        if (option)
        {
            if (option.KeyDown===false) 
            {
                bRegisterKeydown=false;
                JSConsole.Chart.Log('[JSDealChartContainer::Create] not register keydown event.');
            }

            if (option.Wheel===false) 
            {
                bRegisterWheel=false;
                JSConsole.Chart.Log('[JSDealChartContainer::Create] not register wheel event.');
            }
        }

        if (bRegisterKeydown) this.UIElement.addEventListener("keydown", (e)=>{ this.OnKeyDown(e); }, true);            //键盘消息
        if (bRegisterWheel) this.UIElement.addEventListener("wheel", (e)=>{ this.OnWheel(e); }, true);                  //上下滚动消息

        
        this.UIElement.ondblclick=(e)=>{ this.UIOnDblClick(e); }
        this.UIElement.onmousedown=(e)=> { this.UIOnMouseDown(e); }
        this.UIElement.oncontextmenu=(e)=> { this.UIOnContextMenu(e); }
        this.UIElement.onmousemove=(e)=>{ this.UIOnMouseMove(e);}
        this.UIElement.onmouseout=(e)=>{ this.UIOnMounseOut(e); }
        this.UIElement.onmouseleave=(e)=>{ this.UIOnMouseleave(e); }
        

        //手机拖拽
        this.UIElement.ontouchstart=(e)=> { this.OnTouchStart(e); } 
        this.UIElement.ontouchmove=(e)=> {this.OnTouchMove(e); }
        this.UIElement.ontouchend=(e)=> {this.OnTouchEnd(e); } 
    }

    this.Draw=function()
    {
        if (this.UIElement.width<=0 || this.UIElement.height<=0) return; 

        this.Canvas.clearRect(0,0,this.UIElement.width,this.UIElement.height);
        var pixelTatio = GetDevicePixelRatio(); //获取设备的分辨率
        this.Canvas.lineWidth=pixelTatio;       //手机端需要根据分辨率比调整线段宽度

        if (this.ChartSplashPaint && this.ChartSplashPaint.IsEnableSplash)
        {
            this.Frame.Draw( { IsEnableSplash:this.ChartSplashPaint.IsEnableSplash} );
            this.ChartSplashPaint.Draw();
            return;
        }

        this.Frame.Draw();
        this.Frame.DrawLogo();
       
        //框架内图形
        for(var i=0;i<this.ChartPaint.length;++i)
        {
            var item=this.ChartPaint[i];
            if (item.IsDrawFirst)
                item.Draw();
        }

        for(var i=0; i<this.ChartPaint.length; ++i)
        {
            var item=this.ChartPaint[i];
            if (!item.IsDrawFirst)
                item.Draw();
        }
    }


    this.ResetReportStatus=function()
    {
        this.Data.XOffset=0;
        this.Data.YOffset=0;
    }

    this.ResetReportSelectStatus=function()
    {
        var chart=this.GetReportChart();
        if (chart)
        {
            chart.SelectedRow=-1;
            chart.SelectedFixedRow=-1;
        } 
    }

    this.ClearData=function()
    {
        this.SourceData.Data=[];
        this.Data.Data=[];
        this.BlockData=new Map(); 
    }

    this.ResetSortStatus=function()
    {
        this.SortInfo.Field=-1;
        this.SortInfo.Sort=0;
    }

    //设置股票列表
    this.SetSymbolList=function(arySymbol, option)
    {
        this.ClearData();
        this.ResetReportStatus();
        this.ResetSortStatus();
        
        if (IFrameSplitOperator.IsNonEmptyArray(arySymbol))
        {
            for(var i=0;i<arySymbol.length;++i)
            {
                this.Data.Data.push(arySymbol[i]);
            }
        }

        var chart=this.ChartPaint[0];
        if (chart) chart.Data=this.Data;

        this.Draw();
    }

    this.ChangeSymbol=function(symbol, option)
    {
        this.Symbol=symbol;
        this.ClearData();
        this.ResetReportStatus();
        this.ResetSortStatus();
        this.ResetReportSelectStatus();

        if (option)
        {
            if (IFrameSplitOperator.IsNumber(option.TabSelected))
            {
                var chartTab=this.GetTabChart();
                if (chartTab) chartTab.SelectedTabIndex=option.TabSelected;
            }

            if (Array.isArray(option.FixedSymbol))
            {
                var chart=this.GetReportChart();
                if (chart)
                {
                    chart.FixedRowCount=0;
                    this.FixedRowData.Type=1;
                    this.FixedRowData.Symbol=[];
                    var aryData=option.FixedSymbol;
                    for(var i=0; i<aryData.length; ++i)
                    {
                        var item=aryData[i];
                        this.FixedRowData.Symbol.push(item.Symbol);
                        ++chart.FixedRowCount;
                    }

                    this.SetSizeChange(true);
                }
            }

            if (option.SortInfo)
            {
                var item=option.SortInfo;
                if (IFrameSplitOperator.IsNumber(item.Field)) this.SortInfo.Field=item.Field;
                if (IFrameSplitOperator.IsNumber(item.Sort)) this.SortInfo.Sort=item.Sort;
            }
        }

        this.RequestMemberListData();
    }

    this.RequestMemberListData=function()
    {
        //this.ChartSplashPaint.SetTitle(this.SplashTitle.MemberList);
        //this.ChartSplashPaint.EnableSplash(true);
        //this.Draw();

        var self=this;
        if (this.NetworkFilter)
        {
            var obj=
            {
                Name:'JSReportChartContainer::RequestMemberListData', //类名::
                Explain:'板块成分数据',
                Request:{ Data: { symbol: this.Symbol } }, 
                Self:this,
                PreventDefault:false
            };

            if (this.SortInfo.Field>=0 && this.SortInfo.Sort>0)
            {
                var reportChart=this.GetReportChart();
                if (reportChart)
                {
                    var column=reportChart.Column[this.SortInfo.Field];
                    obj.Sort={ Column:column, Field:this.SortInfo.Field, Sort:this.SortInfo.Sort} ;
                }
            }

            this.NetworkFilter(obj, function(data) 
            { 
                self.ChartSplashPaint.EnableSplash(false);
                self.RecvMemberListData(data);
            });

            if (obj.PreventDefault==true) return;   //已被上层替换,不调用默认的网络请求
        }

        throw { Name:'JSReportChartContainer::RequestMemberListData', Error:'(板块成分数据)不提供内置测试数据' };
    }

    this.RecvMemberListData=function(recvData)
    {
        this.ClearData();

        if (IFrameSplitOperator.IsNonEmptyArray(recvData.data))
        {
            for(var i=0;i<recvData.data.length;++i)
            {
                this.Data.Data.push(recvData.data[i]);
                this.SourceData.Data.push(recvData.data[i]);
            }
        }

        this.Draw();
        this.UpdateStockData();
    }

    this.AutoUpdateEvent=function(bStart, explain)          //自定更新事件, 是给websocket使用
    {
        var eventID=bStart ? JSCHART_EVENT_ID.RECV_START_AUTOUPDATE:JSCHART_EVENT_ID.RECV_STOP_AUTOUPDATE;
        if (!this.mapEvent.has(eventID)) return;

        var self=this;
        var event=this.mapEvent.get(eventID);
        var data={ Stock:{ Symbol:this.Symbol, Name:this.Name, DayCount:this.DayCount }, Explain: explain };
        if (bStart) 
        {
            data.Callback=function(data) //数据到达更新回调
            { 
                self.RecvDealUpdateData(data); 
            }
        }
        event.Callback(event,data,this);
    }

    //下载码表
    this.RequestStockListData=function(option)
    {
        this.ChartSplashPaint.SetTitle(this.SplashTitle.StockList);
        this.ChartSplashPaint.EnableSplash(true);
        this.Draw();

        var self=this;
        if (this.NetworkFilter)
        {
            var obj=
            {
                Name:'JSReportChartContainer::RequestStockListData', //类名::
                Explain:'码表数据',
                Self:this,
                PreventDefault:false
            };

            this.NetworkFilter(obj, function(data) 
            { 
                self.ChartSplashPaint.EnableSplash(false);
                self.RecvStockListData(data,option);
            });

            if (obj.PreventDefault==true) return;   //已被上层替换,不调用默认的网络请求
        }

        throw { Name:'JSReportChartContainer::RequestStockListData', Error:'(码表数据)不提供内置测试数据' };
    }

    this.RecvStockListData=function(data, option)
    {
        if (IFrameSplitOperator.IsNonEmptyArray(data.data))
        {
            //0=证券代码 1=股票名称
            for(var i=0;i<data.data.length;++i)
            {
                var item=data.data[i];
                var symbol=item[0];
                var stock=null;
                if (this.MapStockData.has(symbol))
                {
                    stock=this.MapStockData.get(symbol);
                }
                else
                {
                    stock=new HQReportItem();
                    stock.OriginalSymbol=symbol;
                    this.MapStockData.set(symbol, stock);
                }

                stock.Symbol=this.GetSymbolNoSuffix(symbol);
                stock.Name=item[1];
                this.ReadStockJsonData(stock, item);
            }
        }

        if (option && option.Callback)
        {
            option.Callback();
            return;
        }

        this.Draw();
        
        this.UpdateStockData();
    }

    //更新股票数据
    this.UpdateMapStockData=function(data)
    {
        if (!data || !IFrameSplitOperator.IsNonEmptyArray(data.data)) return;
        
        //0=证券代码 1=股票名称
        for(var i=0;i<data.data.length;++i)
        {
            var item=data.data[i];
            var symbol=item[0];
            var stock=null;
            if (this.MapStockData.has(symbol))
            {
                stock=this.MapStockData.get(symbol);
            }
            else
            {
                stock=new HQReportItem();
                stock.OriginalSymbol=symbol;
                this.MapStockData.set(symbol, stock);
            }
            
            stock.Symbol=this.GetSymbolNoSuffix(symbol);
            stock.Name=item[1];
            this.ReadStockJsonData(stock, item);
        }
    }

    //获取个股数据
    this.GetStockData=function(symbol)
    {
        if (!this.MapStockData) return null;
        if (!this.MapStockData.has(symbol)) return null;
        
        return this.MapStockData.get(symbol);
    }

    this.GetBlockData=function(symbol)
    {
        if (!this.BlockData) return null;
        if (!this.BlockData.has(symbol)) return null;

        return this.BlockData.get(symbol);
    }

    //delay=是否延迟
    this.DelayUpdateStockData=function()
    {
        if (this.DelayUpdateTimer!=null) 
        {
            clearTimeout(this.DelayUpdateTimer);
            this.DelayUpdateTimer = null;
        }

        var frequency=this.DelayUpdateFrequency;
        this.DelayUpdateTimer=setTimeout(()=> 
        { 
            this.UpdateStockData();

        },frequency);
    }

    this.UpdateStockData=function()
    {
        if (!IFrameSplitOperator.IsNonEmptyArray(this.Data.Data)) return;

        var chart=this.ChartPaint[0];
        if (!chart) return;

        if (this.SortInfo && this.SortInfo.Field>=0 && this.SortInfo.Sort>0)
        {
            var column=chart.Column[this.SortInfo.Field];
            if (column.Sort==2)
            {
                this.RequestStockSortData(column, this.SortInfo.Field, this.SortInfo.Sort);   //远程排序
                return;
            }
        }

        var arySymbol=chart.ShowSymbol;
        if (!IFrameSplitOperator.IsNonEmptyArray(arySymbol)) return;
        this.RequestStockData(arySymbol);
    }

    //下载股票数据
    this.RequestStockData=function(arySymbol)
    {
        var self=this;
        if (this.NetworkFilter)
        {
            var obj=
            {
                Name:'JSDealChartContainer::RequestStockData', //类名::函数名
                Explain:'报价列表股票数据',
                Request:{ Data: { stocks: arySymbol } }, 
                Self:this,
                PreventDefault:false
            };

            this.NetworkFilter(obj, function(data) 
            { 
                self.RecvStockData(data);
                self.AutoUpdate();
            });

            if (obj.PreventDefault==true) return;  
        }

        throw { Name:'JSReportChartContainer::RequestStockData', Error:'(报价列表股票数据)不提供内置测试数据' };
    }

    this.RecvStockData=function(data)
    {
        var setUpdateSymbol=new Set(); //更新的股票列表
        if (IFrameSplitOperator.IsNonEmptyArray(data.data))
        {
            //0=证券代码 1=股票名称 2=昨收 3=开 4=高 5=低 6=收 7=成交量 8=成交金额, 9=买价 10=买量 11=卖价 12=卖量 13=均价 14=流通股 15=总股本
            for(var i=0;i<data.data.length;++i)
            {
                var item=data.data[i];
                var symbol=item[0];
                if (!symbol) continue;
                var stock=null;
                if (this.MapStockData.has(symbol))
                {
                    stock=this.MapStockData.get(symbol);
                }
                else
                {
                    stock=new HQReportItem();
                    stock.OriginalSymbol=symbol;
                    stock.Symbol=this.GetSymbolNoSuffix(symbol);
                    this.MapStockData.set(symbol, stock);
                }

                this.ReadStockJsonData(stock, item);

                if (!setUpdateSymbol.has(symbol)) setUpdateSymbol.add(symbol);
            }
        }

        var chart=this.ChartPaint[0];
        if (!chart) return;

        //更新的股票在当前页面,需要重绘
        var bUpdate=false;
        var aryStock=chart.ShowSymbol;
        for(var i=0;i<aryStock.length;++i)
        {
            if (setUpdateSymbol.has(aryStock[i].Symbol))
            {
                bUpdate=true;
                break;
            }
        }

        if (bUpdate) this.Draw();
    }

    //读取单条股票json数据
    this.ReadStockJsonData=function(stock, item)
    {
        //0=证券代码 1=股票名称 2=昨收 3=开 4=高 5=低 6=收 7=成交量 8=成交金额, 9=买价 10=买量 11=卖价 12=卖量 13=均价 14=流通股 15=总股本 16=涨停价 17=跌停价
        //18=内盘 19=外盘 20=现量 21=涨幅% 22=涨跌 23=换手率% 24=振幅% 25=流通市值 26=总市值
        //30=全局扩展数据  31=当前板块扩展数据

        if (IFrameSplitOperator.IsString(item[1])) stock.Name=item[1];
        if (IFrameSplitOperator.IsNumber(item[2])) stock.YClose=item[2];
        if (IFrameSplitOperator.IsNumber(item[3])) stock.Open=item[3];
        if (IFrameSplitOperator.IsNumber(item[4])) stock.High=item[4];
        if (IFrameSplitOperator.IsNumber(item[5])) stock.Low=item[5];
        if (IFrameSplitOperator.IsNumber(item[6])) stock.Price=item[6];
        if (IFrameSplitOperator.IsNumber(item[7])) stock.Vol=item[7];
        if (IFrameSplitOperator.IsNumber(item[8])) stock.Amount=item[8];

        if (IFrameSplitOperator.IsNumber(item[9])) stock.BuyPrice=item[9];
        if (IFrameSplitOperator.IsNumber(item[10])) stock.BuyVol=item[10];
        if (IFrameSplitOperator.IsNumber(item[11])) stock.SellPrice=item[11];
        if (IFrameSplitOperator.IsNumber(item[12])) stock.SellVol=item[12];
        if (IFrameSplitOperator.IsNumber(item[13])) stock.AvPrice=item[13];          //均价
        if (IFrameSplitOperator.IsNumber(item[14])) stock.OutShares=item[14];        //流通股
        if (IFrameSplitOperator.IsNumber(item[15])) stock.TotalShares=item[15];      //总股本
        if (IFrameSplitOperator.IsNumber(item[16])) stock.LimitHigh=item[16];        //涨停价
        if (IFrameSplitOperator.IsNumber(item[17])) stock.LimitLow=item[17];         //跌停价
        if (IFrameSplitOperator.IsNumber(item[18])) stock.VolIn=item[18];            //内盘
        if (IFrameSplitOperator.IsNumber(item[19])) stock.VolOut=item[19];           //外盘
        if (IFrameSplitOperator.IsNumber(item[20])) stock.DealNum=item[20];          //现量

        if (IFrameSplitOperator.IsNumber(item[21])) stock.Increase=item[21];         //涨幅%
        if (IFrameSplitOperator.IsNumber(item[22])) stock.UpDown=item[22];           //涨跌
        if (IFrameSplitOperator.IsNumber(item[23])) stock.Exchange=item[23];         //换手率%
        if (IFrameSplitOperator.IsNumber(item[24])) stock.Amplitude=item[24];        //振幅%
        if (IFrameSplitOperator.IsNumber(item[25])) stock.CircMarketValue=item[25];  //流通市值
        if (IFrameSplitOperator.IsNumber(item[26])) stock.MarketValue=item[26];      //总市值

        //衍生数据计算
        if (!IFrameSplitOperator.IsNumber(item[21]))    //涨幅%
        {
            if (IFrameSplitOperator.IsNumber(stock.Price) && IFrameSplitOperator.IsNumber(stock.YClose) && stock.YClose!=0)
                stock.Increase=(stock.Price-stock.YClose)/stock.YClose*100;
        }

        if (!IFrameSplitOperator.IsNumber(item[22]))    //涨跌
        {
            if (IFrameSplitOperator.IsNumber(stock.Price) && IFrameSplitOperator.IsNumber(stock.YClose))
                stock.UpDown=stock.Price-stock.YClose;
        }   

        if (!IFrameSplitOperator.IsNumber(item[23]))    //换手率%
        {
            if (IFrameSplitOperator.IsNumber(stock.Vol) && IFrameSplitOperator.IsNumber(stock.OutShares) && stock.OutShares>0)
                stock.Exchange=stock.Vol/stock.OutShares*100;
        }

        if (!IFrameSplitOperator.IsNumber(item[24]))    //振幅%
        {
            if (IFrameSplitOperator.IsNumber(stock.High) && IFrameSplitOperator.IsNumber(stock.Low) && IFrameSplitOperator.IsNumber(stock.YClose) && stock.YClose!=0)
                stock.Amplitude=(stock.High-stock.Low)/stock.YClose*100;
        }

        if (!IFrameSplitOperator.IsNumber(item[25]))    //流通市值
        {
            if (IFrameSplitOperator.IsNumber(stock.OutShares) && IFrameSplitOperator.IsNumber(stock.Price)) 
                stock.CircMarketValue=stock.OutShares*stock.Price;
        }

        if (!IFrameSplitOperator.IsNumber(item[26]))     //总市值
        {
            if (IFrameSplitOperator.IsNumber(stock.TotalShares) && IFrameSplitOperator.IsNumber(stock.Price)) 
                stock.MarketValue=stock.TotalShares*stock.Price;
        }

        if (item[30]) 
            stock.ExtendData=item[30];                            //30=全局扩展数据

        if (item[31]) 
            this.BlockData.set(stock.OriginalSymbol,item[31]);    //31=当前板块数据
    }



    this.GetSymbolNoSuffix=function(symbol)
    {
        var index=symbol.lastIndexOf(".");
        if (index>0) 
            return symbol.substring(0,index);
        else 
            return symbol;
    }

    this.CancelAutoUpdate=function()    //关闭停止更新
    {
        if (typeof (this.AutoUpdateTimer) == 'number') 
        {
            clearTimeout(this.AutoUpdateTimer);
            this.AutoUpdateTimer = null;
        }
    }

    this.AutoUpdate=function(waitTime)  //waitTime 更新时间
    {
        this.CancelAutoUpdate();
        if (!this.IsAutoUpdate) return;
        
        var self = this;
        var marketStatus=2;
        var event=this.GetEventCallback(JSCHART_EVENT_ID.ON_REPORT_MARKET_STATUS);
        if (event && event.Callback)
        {
            var sendData={ MarketStatus:2 };
            event.Callback(event, sendData, this);
            if (IFrameSplitOperator.IsNumber(sendData.MarketStatus)) marketStatus=sendData.MarketStatus;
        }
        
        if (marketStatus==0 || marketStatus==3) return; //闭市,盘后

        var frequency=this.AutoUpdateFrequency;
        if (marketStatus==1) //盘前
        {
            this.AutoUpdateTimer=setTimeout(function() 
            { 
                self.AutoUpdate(); 
            },frequency);
        }
        else if (marketStatus==2) //盘中
        {
            this.AutoUpdateTimer=setTimeout(function()
            {
                self.UpdateStockData();
            },frequency);
        }
    }

    this.StopAutoUpdate=function()
    {
        this.CancelAutoUpdate();
        this.AutoUpdateEvent(false,'JSDealChartContainer::StopAutoUpdate');
        if (!this.IsAutoUpdate) return;
        this.IsAutoUpdate=false;
    }

    //设置事件回调
    //{event:事件id, callback:回调函数}
    this.AddEventCallback=function(object)
    {
        if (!object || !object.event || !object.callback) return;

        var data={Callback:object.callback, Source:object};
        this.mapEvent.set(object.event,data);
    }

    this.RemoveEventCallback=function(eventid)
    {
        if (!this.mapEvent.has(eventid)) return;

        this.mapEvent.delete(eventid);
    }

    this.GetEventCallback=function(id)  //获取事件回调
    {
        if (!this.mapEvent.has(id)) return null;
        var item=this.mapEvent.get(id);
        return item;
    }

    this.OnSize=function()
    {
        if (!this.Frame) return;

        this.SetSizeChange(true);
        this.Draw();
        this.DelayUpdateStockData();
    }

    this.SetSizeChange=function(bChanged)
    {
        for(var i=0;i<this.ChartPaint.length;++i)
        {
            var chart=this.ChartPaint[i];
            if (chart) chart.SizeChange=bChanged;
        }
    }


    this.OnWheel=function(e)    //滚轴
    {
        JSConsole.Chart.Log('[JSReportChartContainer::OnWheel]',e);
        if (this.ChartSplashPaint && this.ChartSplashPaint.IsEnableSplash == true) return;
        if (!this.Data || !IFrameSplitOperator.IsNonEmptyArray(this.Data.Data)) return;

        var x = e.clientX-this.UIElement.getBoundingClientRect().left;
        var y = e.clientY-this.UIElement.getBoundingClientRect().top;

        var isInClient=false;
        this.Canvas.beginPath();
        this.Canvas.rect(this.Frame.ChartBorder.GetLeft(),this.Frame.ChartBorder.GetTop(),this.Frame.ChartBorder.GetWidth(),this.Frame.ChartBorder.GetHeight());
        isInClient=this.Canvas.isPointInPath(x,y);
        if (!isInClient) return;

        var chart=this.ChartPaint[0];
        if (!chart) return;

        var wheelValue=e.wheelDelta;
        if (!IFrameSplitOperator.IsObjectExist(e.wheelDelta))
            wheelValue=e.deltaY* -0.01;

        if (wheelValue<0)   //下一页
        {
            if (this.GotoNextPage(this.PageUpDownCycle)) 
            {
                this.Draw();
                this.DelayUpdateStockData();
            }
        }
        else if (wheelValue>0)  //上一页
        {
            if (this.GotoPreviousPage(this.PageUpDownCycle)) 
            {
                this.Draw();
                this.DelayUpdateStockData();
            }
        }

        if(e.preventDefault) e.preventDefault();
        else e.returnValue = false;
    }

    this.OnKeyDown=function(e)
    {
        if (this.ChartSplashPaint && this.ChartSplashPaint.IsEnableSplash == true) return;
        var reportChart=this.GetReportChart();
        if (!reportChart) return;

        var keyID = e.keyCode ? e.keyCode :e.which;
        switch(keyID)
        {
            case 33:    //page up
                if (this.GotoPreviousPage(this.PageUpDownCycle)) 
                {
                    this.Draw();
                    this.DelayUpdateStockData();
                }
                break;
            case 34:    //page down
                if (this.GotoNextPage(this.PageUpDownCycle)) 
                {
                    this.Draw();
                    this.DelayUpdateStockData();
                }
                break;
            case 38:    //up
                var result=this.MoveSelectedRow(-1);
                if (result)
                {
                    if (result.Redraw) this.Draw();
                    if (result.Update) this.DelayUpdateStockData();
                }
                break;
            case 40:    //down
                var result=this.MoveSelectedRow(1)
                if (result)
                {
                    if (result.Redraw) this.Draw();
                    if (result.Update) this.DelayUpdateStockData();
                }
                break;
            case 37: //left
                if (this.MoveXOffset(-1)) this.Draw();
                break
            case 39: //right
                if (this.MoveXOffset(1)) this.Draw();
                break;
        }

        //不让滚动条滚动
        if(e.preventDefault) e.preventDefault();
        else e.returnValue = false;
    }

    this.UIOnDblClick=function(e)
    {
        var pixelTatio = GetDevicePixelRatio();
        var x = (e.clientX-this.UIElement.getBoundingClientRect().left)*pixelTatio;
        var y = (e.clientY-this.UIElement.getBoundingClientRect().top)*pixelTatio;

        var chart=this.ChartPaint[0];
        if (chart) chart.OnDblClick(x,y,e);
    }

    this.UIOnMouseDown=function(e)
    {
        this.DragXScroll=null;
        this.DragMove={ Click:{ X:e.clientX, Y:e.clientY }, Move:{X:e.clientX, Y:e.clientY}, PreMove:{X:e.clientX, Y:e.clientY } };

        var pixelTatio = GetDevicePixelRatio();
        var x = (e.clientX-this.UIElement.getBoundingClientRect().left)*pixelTatio;
        var y = (e.clientY-this.UIElement.getBoundingClientRect().top)*pixelTatio;

        var chart=this.ChartPaint[0];
        if (chart) 
        {
            var clickData=chart.OnMouseDown(x,y,e);
            if (!clickData) return;
            //if (e.button!=0) return;

            if ((clickData.Type==2 || clickData.Type==4) && (e.button==0 || e.button==2))  //点击行|固定行
            {
                if (e.button==0 && clickData.Type==2)
                {
                    if (this.EnableDragRow && this.SortInfo.Sort<=0)
                    {
                        this.DragRow={ Click:{ X:e.clientX, Y:e.clientY }, LastMove:{ X:e.clientX, Y:e.clientY} , Data:clickData };
                    }
                }

                if (clickData.Redraw==true)
                    this.Draw();
            }
            else if (clickData.Type==3 && e.button==0) //表头
            {
                this.OnClickHeader(clickData, e);
            }
            else if (clickData.Type==1 && e.button==0) //底部工具栏
            {
                var tabData=clickData.Tab;
                if (tabData.Type==1)    //左按钮
                {
                    if (this.MoveXOffset(-1)) this.Draw();
                }
                else if (tabData.Type==2)   //右按钮
                {
                    if (this.MoveXOffset(1)) this.Draw();
                }
                else if (tabData.Type==3)   //滚动条
                {
                    this.DragXScroll={ Click:{X:x, Y:y}, LastMove:{X:x, Y:y} };
                }
                else if (tabData.Type==4)   //滚动条内部
                {
                    if (this.SetXOffset(tabData.Pos)) this.Draw();
                }
                else if (tabData.Type==5)   //标签
                {
                    this.OnClickTab(tabData, e);
                }
            }
        }

        document.onmousemove=(e)=>{ this.DocOnMouseMove(e); }
        document.onmouseup=(e)=> { this.DocOnMouseUp(e); }
    }

    //去掉右键菜单
    this.UIOnContextMenu=function(e)
    {
        e.preventDefault();
    }

    this.UIOnMouseMove=function(e)
    {
        var pixelTatio = GetDevicePixelRatio();
        var x = (e.clientX-this.UIElement.getBoundingClientRect().left)*pixelTatio;
        var y = (e.clientY-this.UIElement.getBoundingClientRect().top)*pixelTatio;

        if (this.DragRow) return;

        var tabChart=this.GetTabChart();
        if (tabChart)
        {
            var tabData=tabChart.PtInTab(x,y);
            if (tabData)
            {
                var index=tabData.Index;
                if (tabChart.MoveOnTabIndex!=index)
                {
                    tabChart.MoveOnTabIndex=index;
                    this.Draw();
                }
            }
        }
    }

    this.UIOnMounseOut=function(e)
    {
        var tabChart=this.GetTabChart();
        if (tabChart && tabChart.MoveOnTabIndex>=0)
        {
            tabChart.MoveOnTabIndex=-1;
            this.Draw();
        }
    }

    this.UIOnMouseleave=function(e)
    {
        var tabChart=this.GetTabChart();
        if (tabChart && tabChart.MoveOnTabIndex>=0)
        {
            tabChart.MoveOnTabIndex=-1;
            this.Draw();
        }
    }

    this.DocOnMouseMove=function(e)
    {
        this.DragMove.PreMove.X=this.DragMove.Move.X;
        this.DragMove.PreMove.Y=this.DragMove.Move.Y;
        this.DragMove.Move.X=e.clientX;
        this.DragMove.Move.Y=e.clientX;

        if (this.DragMove.Move.X!=this.DragMove.PreMove.X || this.DragMove.Move.Y!=this.DragMove.PreMove.Y)
            this.StopAutoDragScrollTimer();

        if (this.ChartSplashPaint && this.ChartSplashPaint.IsEnableSplash == true) return;

        var pixelTatio = GetDevicePixelRatio();
        var x = (e.clientX-this.UIElement.getBoundingClientRect().left)*pixelTatio;
        var y = (e.clientY-this.UIElement.getBoundingClientRect().top)*pixelTatio;

        //JSConsole.Chart.Log(`[JSReportChartContainer::DocOnMouseMove] x=${x}, y=${y}`);
        
        if (this.DragRow)
        {
            var drag=this.DragRow;
            var moveSetpY=drag.LastMove.Y-e.clientY;
            if (Math.abs(moveSetpY)<2) return;
            var reportChart=this.GetReportChart();
            drag.LastMove.X=e.clientX;
            drag.LastMove.Y=e.clientY;
            drag.Inside={X:x, Y:y};

            if (reportChart) 
            {
                var moveRow=reportChart.OnDrawgRow(x,y,e);
                if (moveRow )
                {
                    if (moveRow.Type==2)
                    {
                        if (moveRow.Data.DataIndex!=drag.Data.Row.DataIndex)
                        {
                            drag.MoveRow=moveRow;
                        }
                    }
                    else if (moveRow.Type==7)
                    {
                        var pageStatus=reportChart.GetCurrentPageStatus();
                        if (!pageStatus.IsEnd)
                        {
                            this.MoveYOffset(1, false);
                            drag.MoveRow=null;

                            this.EnablePageScroll=true;
                            this.AutoScrollPage(2);
                        }
                    }
                    else if (moveRow.Type==5)
                    {
                        if (this.Data.YOffset>0)
                        {
                            this.MoveYOffset(-1, false);
                            drag.MoveRow=null;

                            this.EnablePageScroll=true;
                            this.AutoScrollPage(-2);
                        }
                    }
                }
                reportChart.DragRow=drag;
            }

            this.Draw();
        }
        else if (this.DragXScroll)
        {
            var chart=this.ChartPaint[0];
            if (!chart || !chart.Tab) return;

            this.DragXScroll.LastMove.X=x;
            this.DragXScroll.LastMove.Y=y;
            var pos=chart.Tab.GetScrollPostionByPoint(x,y);
            if (this.SetXOffset(pos)) this.Draw();
        }
    }

    this.DocOnMouseUp=function(e)
    {
        //清空事件
        document.onmousemove=null;
        document.onmouseup=null;

        this.StopAutoDragScrollTimer();

        var bRedraw=false;
        if (this.DragRow) 
        { 
            var reportChart=this.GetReportChart();
            if (reportChart) 
            {
                this.OnDragRow();
                reportChart.DragRow=null;
            }
            bRedraw=true;
        }

        this.DragXScroll=null;
        this.DragRow=null;
        this.DragMove=null;

        if (bRedraw) this.Draw();
    }

    this.OnDragRow=function()
    {
        if (!this.SourceData || !IFrameSplitOperator.IsNonEmptyArray(this.SourceData.Data)) return;
        if (!this.DragRow || !this.DragRow.MoveRow) return;
        var drag=this.DragRow;
        var srcIndex=drag.Data.Row.DataIndex;
        var moveIndex=drag.MoveRow.Data.DataIndex;
        if (srcIndex==moveIndex || srcIndex<0 || moveIndex<0)  return;

        var data=this.SourceData.Data;
        if (srcIndex>=data.length || moveIndex>=data.length) return;

        var event=this.GetEventCallback(JSCHART_EVENT_ID.ON_REPORT_DRAG_ROW);
        if (event)
        {
            var sendData=
            { 
                Symbol:this.Symbol,
                Src:{ Index:srcIndex, Symbol:data[srcIndex] },
                To:{ Index:moveIndex, Symbol:data[moveIndex] },
                PreventDefault:false    //PreventDefault 是否阻止内置的点击处理
            };    
            event.Callback(event,sendData,this);
            if (sendData.PreventDefault) return;
        }

        if (this.DragRowType==1)
        {
            //原始数据交换顺序
            var temp=data[srcIndex];
            data[srcIndex]=data[moveIndex];
            data[moveIndex]=temp;
            this.Data.Data=data.slice(0);
        }
        else
        {
            //插入模式
            var srcItem=data[srcIndex];
            data.splice(srcIndex,1);
            data.splice(moveIndex, 0, srcItem);
            this.Data.Data=data.slice(0);
        }

        //更新选中行
        var reportChart=this.GetReportChart();
        if (reportChart)
        {
            if (reportChart.SelectedModel==0)  reportChart.SelectedRow=drag.MoveRow.Data.Index;
            else reportChart.SelectedRow=drag.MoveRow.Data.DataIndex;
        }
    }

    //判断是单个手指
    this.IsPhoneDragging=function(e)
    {
        // JSConsole.Chart.Log(e);
        var changed=e.changedTouches.length;
        var touching=e.touches.length;

        return changed==1 && touching==1;
    }

    this.GetTouchData=function(e)
    {
        var touches=[];
        var pixelTatio = GetDevicePixelRatio(); //获取设备的分辨率
        for(var i=0; i<e.touches.length; ++i)
        {
            var item=e.touches[i];
            var toucheItem=
            { 
                clientX:item.clientX*pixelTatio,
                clientY:item.clientY*pixelTatio, 

                pageX:item.pageX*pixelTatio,
                pageY:item.pageY*pixelTatio,

                //内部相对坐标
                InsideX:(item.clientX-this.UIElement.getBoundingClientRect().left)*pixelTatio,
                InsideY:(item.clientY-this.UIElement.getBoundingClientRect().top)*pixelTatio
            };

            
            touches.push(toucheItem); 
        }

        return touches;
    }

    this.GetMoveAngle=function(pt,pt2)  //计算角度
    {
        var xMove=Math.abs(pt.X-pt2.X);
        var yMove=Math.abs(pt.Y-pt2.Y);
        var angle=Math.atan(xMove/yMove)*180/Math.PI;
        return angle;
    }

    this.PreventTouchEvent=function(e)
    {
        if (e.cancelable) e.preventDefault();
        e.stopPropagation();
    }

     //手势事件
    this.OnTouchStart=function(e)
    {
        if (this.ChartSplashPaint && this.ChartSplashPaint.IsEnableSplash == true) return;
        this.IsOnTouch=true;

        var reportChart=this.GetReportChart();
        if (!reportChart) return;

        if (this.IsPhoneDragging(e))
        {
            var drag= { "Click":{}, "LastMove":{}, "InsideClick":{}  }; //LastMove 最后移动的位置
            var touches=this.GetTouchData(e);

            drag.Click.X=touches[0].clientX;
            drag.Click.Y=touches[0].clientY;
            drag.InsideClick.X=touches[0].InsideX;
            drag.InsideClick.Y=touches[0].InsideY;
            drag.LastMove.X=touches[0].clientX;
            drag.LastMove.Y=touches[0].clientY;
            drag.IsXMove=false;
            drag.IsYMove=false;


            if (reportChart.IsPtInBody(drag.InsideClick.X,drag.InsideClick.Y))
            {
                this.TouchDrag=drag;
            }

            this.TouchInfo={ InsideClick:{ X:touches[0].InsideX, Y:touches[0].InsideY }, Click:{ X:touches[0].clientX, Y:touches[0].clientY } };
            this.PreventTouchEvent(e);
        }
    }

    this.OnDragYOffset=function(drag, touches, moveUpDown, e)
    {
        if (moveUpDown<5) return false

        var isUp=true;
        if (drag.LastMove.Y<touches[0].clientY) isUp=false;     //Down

        var oneStep=this.YStepPixel;
        if (oneStep<=0) oneStep=5;

        var step=parseInt(moveUpDown/oneStep); 
        if (step<=0) return false

        if (isUp==false) step*=-1;

        if (this.MoveYOffset(step, this.DragPageCycle))
        {
            drag.IsYMove=true;
            this.Draw();
            this.DelayUpdateStockData();
        }

        return true;
    }

    this.OnDragXOffset=function(drag, touches, moveLeftRight, e)
    {
        if (moveLeftRight<5) return false;

        var isLeft=true;
        if (drag.LastMove.X<touches[0].clientX) isLeft=false;//右移数据

        var oneStep=this.XStepPixel;
        if (oneStep<=0) oneStep=5;

        var step=parseInt(moveLeftRight/oneStep);  //除以4个像素
        if (step<=0) return false;

        if (!isLeft) step*=-1;

        if (this.MoveXOffset(step))
        {
            drag.IsXMove=true;
            this.Draw();
        }

        return true;
    }

    this.OnTouchMove=function(e)
    {
        if (this.ChartSplashPaint && this.ChartSplashPaint.IsEnableSplash == true) return;

        var reportChart=this.GetReportChart();
        if (!reportChart) return;

        var touches=this.GetTouchData(e);
        
        if (this.IsPhoneDragging(e))
        {
            var drag=this.TouchDrag;

            this.TouchInfo.Move={ X:touches[0].clientX, Y:touches[0].clientY };

            if (drag)
            {
                this.PreventTouchEvent(e);

                var moveAngle=this.GetMoveAngle(drag.LastMove,{X:touches[0].clientX, Y:touches[0].clientY});
                var moveLeftRight=Math.abs(drag.LastMove.X-touches[0].clientX);
                var moveUpDown=Math.abs(drag.LastMove.Y-touches[0].clientY);

               
                if (drag.IsYMove==true)
                {
                    this.ShowPageInfo(true);
                    if (!this.OnDragYOffset(drag, touches,moveUpDown, e)) return;
                }
                else if (drag.IsXMove==true)
                {
                    if (!this.OnDragXOffset(drag, touches,moveLeftRight, e)) return;
                }
                else if (moveUpDown>0 && moveAngle<this.TouchMoveMinAngle)
                {
                    this.ShowPageInfo(true);
                    if (!this.OnDragYOffset(drag, touches,moveUpDown, e)) return;
                }
                else if (moveLeftRight>0 && moveAngle>=this.TouchMoveMinAngle)
                {
                    if (!this.OnDragXOffset(drag, touches,moveLeftRight, e)) return;
                }
                else
                {
                    return;
                }

                drag.LastMove.X=touches[0].clientX;
                drag.LastMove.Y=touches[0].clientY;
            }

        }
    }

    this.OnTouchEnd=function(e)
    {
        JSConsole.Chart.Log('[JSReportChartContainer:OnTouchEnd]',e);
        if (this.ChartSplashPaint && this.ChartSplashPaint.IsEnableSplash == true) return;

        this.ShowPageInfo(false);
        this.OnTouchClick(this.TouchInfo, e);

        this.IsOnTouch=false;
        this.TouchDrag=null;
        this.TouchInfo=null;
    }

    this.OnTouchClick=function(touchInfo, e)
    {
        if (!touchInfo || !touchInfo.Click) return false;
        if (touchInfo.Move) return false;
        var clickPoint=touchInfo.InsideClick;
        var reportChart=this.GetReportChart();
        if (!reportChart) return false;

        var clickData=reportChart.OnMouseDown(clickPoint.X,clickPoint.Y,e);
        if (!clickData) return false;

        if (clickData.Type==2 || clickData.Type==4)  //点击行
        {
            if (clickData.Redraw==true)
                this.Draw();
        }
        else if (clickData.Type==3) //表头
        {
            this.OnClickHeader(clickData, e);
        }

        JSConsole.Chart.Log('[JSReportChartContainer:OnTouchClick] clickData', clickData);
    }

    this.GetTabChart=function()
    {
        var chart=this.ChartPaint[0];
        if (!chart) return null;
        
        return chart.Tab;
    }

    this.GetReportChart=function()
    {
        var chart=this.ChartPaint[0];
        return chart;
    }

    this.GotoNextPage=function(bCycle) //bCycle 是否循环
    {
        if (!this.Data || !IFrameSplitOperator.IsNonEmptyArray(this.Data.Data)) return false;
        var chart=this.ChartPaint[0];
        if (!chart) return false;

        var pageSize=chart.GetPageSize();
        if (pageSize>this.Data.Data.length) return false;
        if (this.Data.YOffset+pageSize>=this.Data.Data.length) 
        {
            if (bCycle===true)
            {
                this.Data.YOffset=0;    //循环到第1页
                return true;
            }
            else
            {
                return false;
            }
        }

        this.Data.YOffset+=pageSize;
        var showDataCount=this.Data.Data.length-this.Data.YOffset;

        if (chart.SelectedModel==0)
        {
            if (chart.SelectedRow>showDataCount-1) chart.SelectedRow=showDataCount-1;
        }

        return true;
    }

    this.GotoPreviousPage=function(bCycle)  //bCycle 是否循环
    {
        if (!this.Data || !IFrameSplitOperator.IsNonEmptyArray(this.Data.Data)) return false;
        var chart=this.ChartPaint[0];
        if (!chart) return false;
        var pageSize=chart.GetPageSize();
        if (pageSize>this.Data.Data.length) return false;

        if (this.Data.YOffset<=0) 
        {
            if (bCycle===true)
            {
                this.Data.YOffset=this.Data.Data.length-pageSize;   //循环到最后一页
                return true;
            }
            else
            {
                return false;
            }
        }
        
        var offset=this.Data.YOffset;
        offset-=pageSize;
        if (offset<0) offset=0;
        this.Data.YOffset=offset;
        return true;
    }

    this.MoveYOffset=function(setp, bCycle) //bCycle 是否循环
    {
        if (!this.Data || !IFrameSplitOperator.IsNonEmptyArray(this.Data.Data)) return false;
        var chart=this.ChartPaint[0];
        if (!chart) return false;

        var pageStatus=chart.GetCurrentPageStatus();
        if (pageStatus.IsSinglePage) return false;

        if (setp>0) //向上
        {
            var count=this.Data.Data.length;
            var pageSize=pageStatus.PageSize;
            var offset=this.Data.YOffset;
            if (bCycle)
            {
                for(var i=0;i<setp;++i)
                {
                    ++offset;
                    if (offset+pageSize>count) offset=0;
                }
            }
            else
            {
                if (offset+pageSize>=count) return false;

                for(var i=0;i<setp;++i)
                {
                    if (offset+pageSize+1>count) break;
                    ++offset;
                }
            }

            this.Data.YOffset=offset;
            return true;
        }
        else if (setp<0)   //向下
        {
            setp=Math.abs(setp);
            var offset=this.Data.YOffset;
            if (bCycle)
            {
                var pageSize=pageStatus.PageSize;
                for(var i=0;i<setp;++i)
                {
                    --offset;
                    if (offset<0) offset=this.Data.Data.length-pageSize;
                }
            }
            else
            {
                if (this.Data.YOffset<=0) return false;
                for(var i=0;i<setp;++i)
                {
                    if (offset-1<0) break;
                    --offset;
                }
            }

            this.Data.YOffset=offset;
            return true;
        }

        return false;
    }

    this.MoveSelectedRow=function(step)
    {
        var chart=this.ChartPaint[0];
        if (!chart) return null;
        if (!IFrameSplitOperator.IsNonEmptyArray(this.Data.Data)) return null;

        var result={ Redraw:false, Update:false };  //Redraw=重绘, Update=更新数据

        
        if (chart.SelectedModel==0)     //不可翻页模式, 只能在当前页移动
        {
            var pageStatus=chart.GetCurrentPageStatus();
            var pageSize=pageStatus.End-pageStatus.Start+1;
            var selected=pageStatus.SelectedRow;
            if (step>0)
            {
                selected+=step;
                selected=selected%pageSize;
                chart.SelectedRow=selected;
                chart.SelectedFixedRow=-1;
                result.Redraw=true;
                return result;
            }
            else if (step<0)
            {
                selected+=step;
                if (selected<0)
                {
                    selected=selected%pageSize;
                    selected=pageSize+selected;
                }

                chart.SelectedRow=selected;
                chart.SelectedFixedRow=-1;
                result.Redraw=true;
                return result;
            }
        }
        else if (chart.SelectedModel==1)    //可翻页模式
        {
            var pageStatus=chart.GetCurrentPageStatus();
            var pageSize=pageStatus.PageSize;
            var selected=pageStatus.SelectedRow;
            if (step>0)
            {
                if (selected<0 || selected<pageStatus.Start || selected>pageStatus.End)
                {
                    chart.SelectedRow=pageStatus.Start;
                    result.Redraw=true;
                    return result;
                }

                var offset=this.Data.YOffset;
                for(var i=0;i<step;++i)
                {
                    ++selected;
                    if (selected>pageStatus.End) ++offset;

                    if (selected>=this.Data.Data.length)
                    {
                        selected=0;
                        offset=0;
                    }
                }

                result.Redraw=true;
                result.Update=(offset!=this.Data.YOffset);

                chart.SelectedRow=selected;
                this.Data.YOffset=offset;

                return result;
            }
            else if (step<0)
            {
                if (selected<0 || selected<pageStatus.Start || selected>pageStatus.End)
                {
                    chart.SelectedRow=pageStatus.End;
                    result.Redraw=true;
                    return result;
                }

                step=Math.abs(step);
                var offset=this.Data.YOffset;
                for(var i=0;i<step;++i)
                {
                    --selected;
                    if (selected<pageStatus.Start) --offset;

                    if (selected<0)
                    {
                        selected=this.Data.Data.length-1;
                        offset=this.Data.Data.length-pageSize;
                        if (offset<0) offset=0;
                    }
                }

                result.Redraw=true;
                result.Update=(offset!=this.Data.YOffset);

                chart.SelectedRow=selected;
                this.Data.YOffset=offset;

                return result;
            }
        }

        return null;
    }

    //左右移动
    this.MoveXOffset=function(step)
    {
        var chart=this.ChartPaint[0];
        if (!chart) return false;
        var maxOffset=chart.GetXScrollRange();
        if (maxOffset<=0) return false;

        if (step>0)
        {
            if (this.Data.XOffset>=maxOffset) return false;
            for(var i=0;i<step;++i)
            {
                if (this.Data.XOffset>=maxOffset) break;
                ++this.Data.XOffset;
            }

            return true;
        }
        else if (step<0)
        {
            if (this.Data.XOffset<=0) return false;
            step=Math.abs(step);
            for(var i=0;i<step;++i)
            {
                if (this.Data.XOffset-1<0) break;
                --this.Data.XOffset;
            }
            return true;
        }

        return false;
    }

    this.SetXOffset=function(pos)
    {
        if (!IFrameSplitOperator.IsNumber(pos)) return false;

        var chart=this.ChartPaint[0];
        if (!chart) return false;
        var maxOffset=chart.GetXScrollRange();
        if (pos<0) pos=0;
        if (pos>maxOffset) pos=maxOffset;

        this.Data.XOffset=pos;

        return true;
    }

    this.GotoLastPage=function()
    {
        var chart=this.ChartPaint[0];
        if (!chart) return;

        //显示最后一屏
        var pageSize=chart.GetPageSize(true);
        var offset=this.Data.Data.length-pageSize;
        if (offset<0) offset=0;
        this.Data.DataOffset=offset;
    }

    this.SetColumn=function(aryColunm, option)
    {
        var chart=this.ChartPaint[0];
        if (!chart)  return;

        chart.SetColumn(aryColunm);
        chart.SizeChange=true;

        if (option && option.Redraw) this.Draw();
    }

    this.SetTab=function(aryTab, option)
    {
        var chart=this.ChartPaint[0];;
        if (!chart) return;

        var chartTab=chart.Tab;
        if (!chartTab) return;

        chartTab.SetTabList(aryTab);

        if (option && option.Redraw) this.Draw();
    }

    this.SetSelectedTab=function(index, opiton)
    {
        var chart=this.ChartPaint[0];;
        if (!chart) return;

        var chartTab=chart.Tab;
        if (!chartTab) return;

        chartTab.SelectedTabIndex=index;
    }

    this.ReloadResource=function(option)
    {
        this.Frame.ReloadResource(option);
        
        for(var i=0;i<this.ChartPaint.length;++i)
        {
            var item=this.ChartPaint[i];
            if (item.ReloadResource) item.ReloadResource(option);
        }

        if (option && option.Redraw)
        {
            this.SetSizeChange(true);
            this.Draw();
        }
    }

    //点表头
    this.OnClickHeader=function(clickData, e)
    {
        var header=clickData.Header;
        if (header.Column && (header.Column.Sort==1 || header.Column.Sort==2))
        {
            var index=header.Index;
            var sortInfo={Field:this.SortInfo.Field, Sort:this.SortInfo.Sort };
            var arySortType=header.Column.SortType;
            if (sortInfo.Field!=index)
            {
                sortInfo.Field=index;
                sortInfo.Sort=arySortType[0]
            }
            else
            {
                if (arySortType.length==1) 
                {
                    sortInfo.Sort=arySortType[0];
                }
                else
                {
                    for(var i=0;i<arySortType.length;++i)
                    {
                        if (sortInfo.Sort==arySortType[i])
                        {
                            sortInfo.Sort=arySortType[(i+1)%arySortType.length];
                            break;
                        }
                    }
                }
            }

            if (header.Column.Sort==1 || header.Column.Sort==2)  
            {
                if (sortInfo.Sort==0)
                {
                    this.Data.Data=[];
                    for(var i=0;i<this.SourceData.Data.length;++i)
                    {
                        this.Data.Data.push(this.SourceData.Data[i]);
                    }
                } 
                else
                {
                    if (header.Column.Sort==1)  //本地排序
                    {
                        var event=this.GetEventCallback(JSCHART_EVENT_ID.ON_REPORT_LOCAL_SORT);
                        if (event && event.Callback)
                        {
                            var sendData={ Column:header.Column, SortInfo:sortInfo, SymbolList:this.Data.Data, Result:null };
                            event.Callback (event, sendData, this);
                            if (Array.isArray(sendData.Result)) this.Data.Data=sendData.Result;
                        }
                        else
                        {
                            this.Data.Data.sort((left, right)=> { return this.LocalSort(left, right, header.Column, sortInfo.Sort); });
                        }
                    }
                    else if (header.Column.Sort==2) //远程排序
                    {
                        if (!IFrameSplitOperator.IsNonEmptyArray(this.Data.Data)) return;
                        
                        this.SortInfo.Field=sortInfo.Field;
                        this.SortInfo.Sort=sortInfo.Sort;
                        this.Data.YOffset=0;
                        this.ResetReportSelectStatus();
                        this.RequestStockSortData(header.Column, sortInfo.Field, sortInfo.Sort);   //远程排序
                        return;
                    }
                }

                this.Data.YOffset=0;
                this.ResetReportSelectStatus();
                this.SortInfo.Field=sortInfo.Field;
                this.SortInfo.Sort=sortInfo.Sort;
                this.Draw();
                this.DelayUpdateStockData();
            }
        }
    }

    //点击标签
    this.OnClickTab=function(tabData, e)
    {
        if (!tabData.Tab) return;

        var redraw=false;
        var pixelTatio = GetDevicePixelRatio();
        var x = (e.clientX-this.UIElement.getBoundingClientRect().left)*pixelTatio;
        var y = (e.clientY-this.UIElement.getBoundingClientRect().top)*pixelTatio;
        var uiElement={Left:this.UIElement.getBoundingClientRect().left, Top:this.UIElement.getBoundingClientRect().top};

        if (tabData.Tab.IsMenu)
        {
            var event=this.GetEventCallback(JSCHART_EVENT_ID.ON_CLICK_REPORT_TABMENU);
            if (event && event.Callback)
            {
                redraw=true;
                var rtItem=tabData.Rect;
                var rtDOM={ Left: rtItem.Left/pixelTatio, Right:rtItem.Right/pixelTatio, Top:rtItem.Top/pixelTatio, Bottom:rtItem.Bottom/pixelTatio };

                var sendData={ Data:tabData, IsSide:{X:x, Y:x}, UIElement:uiElement, Rect:rtDOM, e:e , Redraw:redraw };
                event.Callback(event, sendData, this);
                if (IFrameSplitOperator.IsBool(sendData.Redraw)) redraw=sendData.Redraw;
            }

            this.SetSelectedTab(tabData.Index); //选中tab
        }
        else
        {
            var event=this.GetEventCallback(JSCHART_EVENT_ID.ON_CLICK_REPORT_TAB);
            if (event && event.Callback)
            {
                var sendData={ Data:tabData, IsSide:{X:x, Y:x}, UIElement:uiElement, e:e , Redraw:redraw };
                event.Callback(event, sendData, this);
                if (IFrameSplitOperator.IsBool(sendData.Redraw)) redraw=sendData.Redraw;
            }

            this.SetSelectedTab(tabData.Index);
        }

        if (redraw) this.Draw();
    }

    //本地排序
    this.LocalSort=function(left, right, column, sortType)
    {
        switch(column.Type)
        {
            case REPORT_COLUMN_ID.SYMBOL_ID:
            case REPORT_COLUMN_ID.NAME_ID:
                return this.LocalStringSort(left, right, column, sortType);
            case REPORT_COLUMN_ID.PRICE_ID:
            case REPORT_COLUMN_ID.VOL_ID:
            case REPORT_COLUMN_ID.INCREASE_ID:
            case REPORT_COLUMN_ID.UPDOWN_ID:
            case REPORT_COLUMN_ID.BUY_PRICE_ID:
            case REPORT_COLUMN_ID.SELL_PRICE_ID:
            case REPORT_COLUMN_ID.AMOUNT_ID:
            case REPORT_COLUMN_ID.BUY_VOL_ID:
            case REPORT_COLUMN_ID.SELL_VOL_ID:
            case REPORT_COLUMN_ID.YCLOSE_ID:
            case REPORT_COLUMN_ID.OPEN_ID:
            case REPORT_COLUMN_ID.HIGH_ID:
            case REPORT_COLUMN_ID.LOW_ID:
            case REPORT_COLUMN_ID.AVERAGE_PRICE_ID:

            case REPORT_COLUMN_ID.OUTSTANDING_SHARES_ID:
            case REPORT_COLUMN_ID.TOTAL_SHARES_ID:
            case REPORT_COLUMN_ID.CIRC_MARKET_VALUE_ID:
            case REPORT_COLUMN_ID.MARKET_VALUE_ID:

            case REPORT_COLUMN_ID.EXCHANGE_RATE_ID:
            case REPORT_COLUMN_ID.AMPLITUDE_ID:

            case REPORT_COLUMN_ID.LIMIT_HIGH_ID:
            case REPORT_COLUMN_ID.LIMIT_LOW_ID:

            case REPORT_COLUMN_ID.VOL_IN_ID:
            case REPORT_COLUMN_ID.VOL_OUT_ID:
            
                return this.LocalNumberSort(left, right, column, sortType);
            case REPORT_COLUMN_ID.CUSTOM_NUMBER_TEXT_ID:    //自定义数值字段
                return this.LoacCustomNumberSort(left, right, column, sortType);
            case REPORT_COLUMN_ID.CUSTOM_STRING_TEXT_ID:    //自定义字符串字段
                return this.LoacCustomStringSort(left, right, column, sortType);
            case REPORT_COLUMN_ID.CUSTOM_DATETIME_TEXT_ID:
                return this.LoacCustomDateTimeSort(left, right, column, sortType);
            default:

                return 0;
        }
    }

    this.GetStockExtendData=function(symbol,column)
    {
        if (IFrameSplitOperator.IsNumber(column.DataIndex))
        {
            if (column.DataIndex<0) return null;
            var stock=this.GetStockData(symbol);
            if (!stock || !stock.ExtendData) return null;

            return stock.ExtendData[column.DataIndex];
        }

        if (IFrameSplitOperator.IsNumber(column.BlockIndex))
        {
            if (column.BlockIndex<0) return null;
            var stock=this.GetBlockData(symbol);
            if (!stock) return null;

            return stock[column.BlockIndex];
        }

        return null;
    }

    this.LocalStringSort=function(left, right, column, sortType)
    {
        var leftStock=this.GetStockData(left);
        var rightStock=this.GetStockData(right);

        var leftValue="", rightValue="";
        if (sortType==2)
        {
            leftValue="啊啊啊啊啊";
            rightValue="啊啊啊啊啊";
        }

        var filedName=MAP_COLUMN_FIELD.get(column.Type);
        if (leftStock && leftStock[filedName]) leftValue=leftStock[filedName];
        if (rightStock && rightStock[filedName]) rightValue=rightStock[filedName];
        
        if (sortType==1)
        {
            if (rightValue<leftValue) return -1;
            else if (rightValue<leftValue) return 1;
            else return 0;
        }
        else
        {
            if (leftValue<rightValue) return -1;
            else if (leftValue>rightValue) return 1;
            else return 0;
        }
    }

    this.LocalNumberSort=function(left, right, column, sortType)
    {
        var leftStock=this.GetStockData(left);
        var rightStock=this.GetStockData(right);

        var leftValue=-99999999999999, rightValue=-99999999999999;
        if (sortType==2) leftValue=rightValue=99999999999999;

        var filedName=MAP_COLUMN_FIELD.get(column.Type);
        if (leftStock && IFrameSplitOperator.IsNumber(leftStock[filedName])) leftValue=leftStock[filedName];
        if (rightStock && IFrameSplitOperator.IsNumber(rightStock[filedName])) rightValue=rightStock[filedName];
        
      

        if (sortType==1)
        {
            if (rightValue<leftValue) return -1;
            else if (rightValue<leftValue) return 1;
            else return 0;
        }
        else
        {
            if (leftValue<rightValue) return -1;
            else if (leftValue>rightValue) return 1;
            else return 0;
        }
    }

    this.LoacCustomNumberSort=function(left, right, column, sortType)
    {
        var leftValue=-99999999999999, rightValue=-99999999999999;
        if (sortType==2) leftValue=rightValue=99999999999999;

        var value=this.GetStockExtendData(left, column);
        if (IFrameSplitOperator.IsNumber(value)) leftValue=value;

        var value=this.GetStockExtendData(right, column);
        if (IFrameSplitOperator.IsNumber(value)) rightValue=value;

        if (sortType==1)
        {
            if (rightValue<leftValue) return -1;
            else if (rightValue<leftValue) return 1;
            else return 0;
        }
        else
        {
            if (leftValue<rightValue) return -1;
            else if (leftValue>rightValue) return 1;
            else return 0;
        }
    }

    this.LoacCustomDateTimeSort=function(left, right, column, sortType)
    {
        var leftValue=-99999999999999, rightValue=-99999999999999;
        if (sortType==2) leftValue=rightValue=99999999999999;

        var value=this.GetStockExtendData(left, column);
        if (IFrameSplitOperator.IsNumber(value)) leftValue=value;

        var value=this.GetStockExtendData(right, column);
        if (IFrameSplitOperator.IsNumber(value)) rightValue=value;

        if (sortType==1)
        {
            if (rightValue<leftValue) return -1;
            else if (rightValue<leftValue) return 1;
            else return 0;
        }
        else
        {
            if (leftValue<rightValue) return -1;
            else if (leftValue>rightValue) return 1;
            else return 0;
        }
    }

    this.RequestStockSortData=function(column, filedid, sortType)
    {
        var chart=this.ChartPaint[0];
        if (!chart) return;

        var self=this;
        var startIndex=this.Data.YOffset;
        var pageSize=chart.GetPageSize();
        var endIndex=startIndex+pageSize;
        if (endIndex>=this.Data.Data.length) endIndex=this.Data.Data.length-1;

        if (this.NetworkFilter)
        {
            var obj=
            {
                Name:'JSDealChartContainer::RequestStockSortData', //类名::函数名
                Explain:'报价列表股票排序数据',
                Request:
                { 
                    Data: 
                    { 
                        range:{ start:startIndex, end:endIndex, count:this.Data.Data.length }, 
                        column:{ name: column.Title, type: column.Type, index:filedid, ID:column.ID }, 
                        sort:sortType, symbol:this.Symbol, name:this.Name,
                        pageSize:pageSize
                    } 
                }, 
                Self:this,
                PreventDefault:false
            };

            if (chart.FixedRowCount>0 && chart.FixedRowData.Type==1)
            {
                var arySymbol=[];
                for(var i=0;i<chart.FixedRowData.Symbol.length;++i)
                {
                    var item=chart.FixedRowData.Symbol[i];
                    if (item) arySymbol.push(item);
                }

                obj.Request.FixedSymbol=arySymbol;
            }

            this.NetworkFilter(obj, function(data) 
            { 
                self.RecvStockSortData(data);
                self.AutoUpdate();
            });

            if (obj.PreventDefault==true) return;  
        }

        throw { Name:'JSReportChartContainer::RequestStockSortData', Error:'(报价列表股票排序数据)不提供内置测试数据' };
    }

    this.RecvStockSortData=function(data)
    {
        //更新股票数据
        var arySymbol=[];
        if (IFrameSplitOperator.IsNonEmptyArray(data.data))
        {
            for(var i=0;i<data.data.length;++i)
            {
                var item=data.data[i];     //数据
                var symbol=item[0];
                if (!symbol) continue;
                var stock=null;
                if (this.MapStockData.has(symbol))
                {
                    stock=this.MapStockData.get(symbol);
                }
                else
                {
                    stock=new HQReportItem();
                    stock.OriginalSymbol=symbol;
                    stock.Symbol=this.GetSymbolNoSuffix(symbol);
                    this.MapStockData.set(symbol, stock);
                }

                this.ReadStockJsonData(stock, item);

                arySymbol.push(symbol);
            }
        }

        //更新股票顺序
        if (IFrameSplitOperator.IsNonEmptyArray(data.index))
        {
            for(var i=0;i<data.index.length;++i)
            {
                var index=data.index[i];
                var newSymbol=arySymbol[i];
                var oldSymbol=this.Data.Data[index];
                if (newSymbol==oldSymbol) continue;
                this.Data.Data[index]=newSymbol;
            }
        }

        var chart=this.ChartPaint[0];
        if (!chart) return;

        //更新的股票在当前页面,需要重绘
        var bUpdate=true;
        if (bUpdate) this.Draw();
    }

    //底部标签
    this.ShowPageInfo=function(bShow)
    {
        var chart=this.ChartPaint[1];
        if (!chart) return false;

        chart.IsShow=bShow;

        return true;
    }
}



function JSReportFrame()
{
    this.ChartBorder;
    this.Canvas;                            //画布

    this.BorderLine=null;                   //1=上 2=下 4=左 8=右

    this.BorderColor=g_JSChartResource.Report.BorderColor;    //边框线

    this.LogoTextColor=g_JSChartResource.FrameLogo.TextColor;
    this.LogoTextFont=g_JSChartResource.FrameLogo.Font;

    this.ReloadResource=function(resource)
    {
        this.BorderColor=g_JSChartResource.Report.BorderColor;    //边框线
        this.LogoTextColor=g_JSChartResource.FrameLogo.TextColor;
        this.LogoTextFont=g_JSChartResource.FrameLogo.Font;
    }

    this.Draw=function()
    {
        var left=ToFixedPoint(this.ChartBorder.GetLeft());
        var top=ToFixedPoint(this.ChartBorder.GetTop());
        var right=ToFixedPoint(this.ChartBorder.GetRight());
        var bottom=ToFixedPoint(this.ChartBorder.GetBottom());
        var width=right-left;
        var height=bottom-top;

        if (!IFrameSplitOperator.IsNumber(this.BorderLine))
        {
            this.Canvas.strokeStyle=this.BorderColor;
            this.Canvas.strokeRect(left,top,width,height);
        }
        else
        {
            this.Canvas.strokeStyle=this.BorderColor;
            this.Canvas.beginPath();

            if ((this.BorderLine&1)>0) //上
            {
                this.Canvas.moveTo(left,top);
                this.Canvas.lineTo(right,top);
            }

            if ((this.BorderLine&2)>0)  //下
            {
                this.Canvas.moveTo(left,bottom);
                this.Canvas.lineTo(right,bottom);
            }

            if ((this.BorderLine&4)>0)  //左
            {
                this.Canvas.moveTo(left,top);
                this.Canvas.lineTo(left,bottom);
            }

            if ((this.BorderLine&8)>0)    //右
            {
                this.Canvas.moveTo(right,top);
                this.Canvas.lineTo(right,bottom);
            }
              
            this.Canvas.stroke();
        }
    }

    this.DrawLogo=function()
    {
        var text=g_JSChartResource.FrameLogo.Text;
        if (!IFrameSplitOperator.IsString(text)) return;

        this.Canvas.fillStyle=this.LogoTextColor;
        this.Canvas.font=this.LogoTextFont;
        this.Canvas.textAlign = 'right';
        this.Canvas.textBaseline = 'bottom';
       
        var x=this.ChartBorder.GetRight()-30;
        var y=this.ChartBorder.GetBottom()-5;
        this.Canvas.fillText(text,x,y); 
    }
}

var REPORT_COLUMN_ID=
{
    SYMBOL_ID:0,     
    NAME_ID:1,
    PRICE_ID:2,         //成交价格
    VOL_ID:3,           //成交量
    INCREASE_ID:4,      //涨幅
    UPDOWN_ID:5,        //涨跌
    BUY_PRICE_ID:6,     //买价
    SELL_PRICE_ID:7,     //卖价
    AMOUNT_ID:8,        //总金额
    BUY_VOL_ID:9,       //买量
    SELL_VOL_ID:10,     //卖量
    YCLOSE_ID:11,       //昨收
    OPEN_ID:12,
    HIGH_ID:13,
    LOW_ID:14,
    AVERAGE_PRICE_ID:15,//均价
    INDEX_ID:16,         //序号 从1开始

    OUTSTANDING_SHARES_ID:17,   //流通股本
    TOTAL_SHARES_ID:18,         //总股本
    CIRC_MARKET_VALUE_ID:19,    //流通市值
    MARKET_VALUE_ID:20,         //总市值

    EXCHANGE_RATE_ID:21,        //换手率 成交量/流通股本
    AMPLITUDE_ID:22,            //振幅

    LIMIT_HIGH_ID:23,       //涨停价
    LIMIT_LOW_ID:24,        //跌停价

    VOL_IN_ID:25,           //内盘
    VOL_OUT_ID:26,          //外盘

    SYMBOL_NAME_ID:27,

    CUSTOM_STRING_TEXT_ID:100,   //自定义字符串文本
    CUSTOM_NUMBER_TEXT_ID:101,   //自定义数值型
    CUSTOM_DATETIME_TEXT_ID:102  //自定义日期类型
}

var MAP_COLUMN_FIELD=new Map([
    [REPORT_COLUMN_ID.SYMBOL_ID, "Symbol"],
    [REPORT_COLUMN_ID.NAME_ID, "Name"],
    [REPORT_COLUMN_ID.PRICE_ID, "Price"],
    [REPORT_COLUMN_ID.INCREASE_ID, "Increase"],
    [REPORT_COLUMN_ID.UPDOWN_ID, "UpDown"],
    [REPORT_COLUMN_ID.VOL_ID, "Vol"],
    [REPORT_COLUMN_ID.BUY_PRICE_ID, "BuyPrice"],
    [REPORT_COLUMN_ID.SELL_PRICE_ID, "SellPrice"],
    [REPORT_COLUMN_ID.AMOUNT_ID, "Amount"],
    [REPORT_COLUMN_ID.BUY_VOL_ID, "BuyVol"],
    [REPORT_COLUMN_ID.SELL_VOL_ID, "SellVol"],
    [REPORT_COLUMN_ID.YCLOSE_ID, "YClose"],
    [REPORT_COLUMN_ID.OPEN_ID, "Open"],
    [REPORT_COLUMN_ID.HIGH_ID, "High"],
    [REPORT_COLUMN_ID.LOW_ID, "Low"],
    [REPORT_COLUMN_ID.AVERAGE_PRICE_ID,"AvPrice"],

    [REPORT_COLUMN_ID.OUTSTANDING_SHARES_ID,"OutShares"],
    [REPORT_COLUMN_ID.TOTAL_SHARES_ID,"TotalShares"],
    [REPORT_COLUMN_ID.CIRC_MARKET_VALUE_ID,"CircMarketValue"],
    [REPORT_COLUMN_ID.MARKET_VALUE_ID,"MarketValue"],

    [REPORT_COLUMN_ID.EXCHANGE_RATE_ID, "Exchange"],
    [REPORT_COLUMN_ID.AMPLITUDE_ID, "Amplitude"],

    [REPORT_COLUMN_ID.LIMIT_HIGH_ID, "LimitHigh"],
    [REPORT_COLUMN_ID.LIMIT_LOW_ID,"LimitLow"],

    [REPORT_COLUMN_ID.VOL_IN_ID, "VolIn"],
    [REPORT_COLUMN_ID.VOL_OUT_ID,"VolOut"],
]);

function ChartReport()
{
    this.Canvas;                        //画布
    this.ChartBorder;                   //边框信息
    this.ChartFrame;                    //框架画法
    this.Name;                          //名称
    this.ClassName='ChartReport';       //类名
    this.UIElement;
    this.IsDrawFirst=false;
    this.GetEventCallback;              //获取事件
    this.GetStockDataCallback;          //获取股票数据
    this.GetBlockDataCallback;          //获取当前板块的数据
    this.Data;                          //数据 { XOffset:0, YOffset:0, Data:['600000.sh', '000001.sz'] }
    this.FixedRowData;                  //固定行
    this.SortInfo;                      //排序信息 {Field:排序字段id, Sort:0 不排序 1升序 2降序 }    
    this.FixedColumn=2;                 //固定列
    this.FixedRowCount=0;               //固定行         
    
    this.IsShowHeader=true;             //是否显示表头
    this.SizeChange=true;

    this.SelectedModel=0;               //选中模式 0=SelectedRow表示当前屏索引
    this.SelectedRow=-1;                //选中行ID
    this.SelectedFixedRow=-1;           //选中固定行ID
    this.IsDrawBorder=1;                //是否绘制单元格边框

    this.ShowSymbol=[];                 //显示的股票列表 { Index:序号(排序用), Symbol:股票代码 }
    this.DragRow;                       //拖拽行

    this.Tab;

    //涨跌颜色
    this.UpColor=g_JSChartResource.Report.UpTextColor;
    this.DownColor=g_JSChartResource.Report.DownTextColor;
    this.UnchagneColor=g_JSChartResource.Report.UnchagneTextColor; 

    this.BorderColor=g_JSChartResource.Report.BorderColor;          //边框线
    this.SelectedColor=g_JSChartResource.Report.SelectedColor;      //选中行

    //表头配置
    this.HeaderFontConfig={ Size:g_JSChartResource.Report.Header.Font.Size, Name:g_JSChartResource.Report.Header.Font.Name };
    this.HeaderColor=g_JSChartResource.Report.Header.Color;
    this.SortColor=g_JSChartResource.Report.Header.SortColor;      //排序箭头颜色
    this.HeaderMergin=
    { 
        Left:g_JSChartResource.Report.Header.Mergin.Left, 
        Right:g_JSChartResource.Report.Header.Mergin.Right, 
        Top:g_JSChartResource.Report.Header.Mergin.Top, 
        Bottom:g_JSChartResource.Report.Header.Mergin.Bottom
    };

    //表格内容配置
    this.ItemFontConfig={ Size:g_JSChartResource.Report.Item.Font.Size, Name:g_JSChartResource.Report.Item.Font.Name };
    this.ItemFixedFontConfg={ Size:g_JSChartResource.Report.FixedItem.Font.Size, Name:g_JSChartResource.Report.FixedItem.Font.Name }; //固定行
    this.ItemMergin=
    { 
        Left:g_JSChartResource.Report.Item.Mergin.Left, 
        Right:g_JSChartResource.Report.Item.Mergin.Right, 
        Top:g_JSChartResource.Report.Item.Mergin.Top, 
        Bottom:g_JSChartResource.Report.Item.Mergin.Bottom 
    };
    this.BarMergin=
    { 
        Top:g_JSChartResource.Report.Item.BarMergin.Top, 
        Left:g_JSChartResource.Report.Item.BarMergin.Left, 
        Right:g_JSChartResource.Report.Item.BarMergin.Right,
        Bottom:g_JSChartResource.Report.Item.BarMergin.Bottom
    };

    this.LimitBorderColor=g_JSChartResource.Report.LimitBorder.Color;
    this.LimitMergin=
    {
        Top:g_JSChartResource.Report.LimitBorder.Mergin.Top, 
        Left:g_JSChartResource.Report.LimitBorder.Mergin.Left, 
        Right:g_JSChartResource.Report.LimitBorder.Mergin.Right,
        Bottom:g_JSChartResource.Report.LimitBorder.Mergin.Bottom
    }

    this.DragRowColor=g_JSChartResource.Report.DragRow.Color;
    this.DragRowTextColor=g_JSChartResource.Report.DragRow.TextColor;
    this.DragMoveRowColor=g_JSChartResource.Report.DragRow.MoveRowColor;
    this.DragSrcRowColor=g_JSChartResource.Report.DragRow.SrcRowColor;

    //股票代码+股票名称
    this.ItemSymbolFontConfig={Size:g_JSChartResource.Report.Item.SymbolFont.Size, Name:g_JSChartResource.Report.Item.SymbolFont.Name};
    this.ItemNameFontConfg={Size:g_JSChartResource.Report.Item.NameFont.Size, Name:g_JSChartResource.Report.Item.NameFont.Name};

    //缓存
    this.HeaderFont=12*GetDevicePixelRatio() +"px 微软雅黑";
    this.ItemFont=15*GetDevicePixelRatio() +"px 微软雅黑";
    this.ItemFixedFont=15*GetDevicePixelRatio() +"px 微软雅黑";
    this.ItemSymbolFont=12*GetDevicePixelRatio() +"px 微软雅黑";
    this.ItemNameFont=15*GetDevicePixelRatio() +"px 微软雅黑";
    this.ItemNameHeight=0;
    this.RowCount=0;            //一屏显示行数
    this.HeaderHeight=0;        //表头高度
    this.FixedRowHeight=0;      //固定行高度
    this.RowHeight=0;           //行高度
    this.BottomToolbarHeight=0;  //底部工具条高度
    this.IsShowAllColumn=false;   //是否已显示所有列

    this.Column=    //{ Type:列id, Title:标题, TextAlign:文字对齐方式, MaxText:文字最大宽度 , TextColor:文字颜色, Sort:0=不支持排序 1=本地排序 0=远程排序 }
    [
        { Type:REPORT_COLUMN_ID.INDEX_ID, Title:"序号", TextAlign:"center", Width:null, TextColor:g_JSChartResource.Report.FieldColor.Index, MaxText:"8888"},
        { Type:REPORT_COLUMN_ID.SYMBOL_ID, Title:"代码", TextAlign:"left", Width:null,  TextColor:g_JSChartResource.Report.FieldColor.Symbol, MaxText:"888888"},
        { Type:REPORT_COLUMN_ID.NAME_ID, Title:"名称", TextAlign:"left", Width:null, TextColor:g_JSChartResource.Report.FieldColor.Name, MaxText:"擎擎擎擎" },
        { Type:REPORT_COLUMN_ID.INCREASE_ID, Title:"涨幅%", TextAlign:"right", Width:null, MaxText:"-888.88" },
    ];

    this.RectClient={};

    this.ReloadResource=function(resource)
    {
        this.UpColor=g_JSChartResource.Report.UpTextColor;
        this.DownColor=g_JSChartResource.Report.DownTextColor;
        this.UnchagneColor=g_JSChartResource.Report.UnchagneTextColor; 
    
        this.BorderColor=g_JSChartResource.Report.BorderColor;          //边框线
        this.SelectedColor=g_JSChartResource.Report.SelectedColor;      //选中行

        //表头配置
        this.HeaderFontConfig={ Size:g_JSChartResource.Report.Header.Font.Size, Name:g_JSChartResource.Report.Header.Font.Name };
        this.HeaderColor=g_JSChartResource.Report.Header.Color;
        this.SortColor=g_JSChartResource.Report.Header.SortColor;      //排序箭头颜色
        this.HeaderMergin=
        { 
            Left:g_JSChartResource.Report.Header.Mergin.Left, 
            Right:g_JSChartResource.Report.Header.Mergin.Right, 
            Top:g_JSChartResource.Report.Header.Mergin.Top, 
            Bottom:g_JSChartResource.Report.Header.Mergin.Bottom
        };

        //表格内容配置
        this.ItemFontConfig={ Size:g_JSChartResource.Report.Item.Font.Size, Name:g_JSChartResource.Report.Item.Font.Name };
        this.ItemMergin=
        { 
            Left:g_JSChartResource.Report.Item.Mergin.Left, 
            Right:g_JSChartResource.Report.Item.Mergin.Right, 
            Top:g_JSChartResource.Report.Item.Mergin.Top, 
            Bottom:g_JSChartResource.Report.Item.Mergin.Bottom 
        };
        this.BarMergin=
        { 
            Top:g_JSChartResource.Report.Item.BarMergin.Top, 
            Left:g_JSChartResource.Report.Item.BarMergin.Left, 
            Right:g_JSChartResource.Report.Item.BarMergin.Right,
            Bottom:g_JSChartResource.Report.Item.BarMergin.Bottom
        };

        this.LimitBorderColor=g_JSChartResource.Report.LimitBorder.Color;
        this.LimitMergin=
        {
            Top:g_JSChartResource.Report.LimitBorder.Mergin.Top, 
            Left:g_JSChartResource.Report.LimitBorder.Mergin.Left, 
            Right:g_JSChartResource.Report.LimitBorder.Mergin.Right,
            Bottom:g_JSChartResource.Report.LimitBorder.Mergin.Bottom
        }

        for(var i=0;i<this.Column.length;++i)
        {
            var item=this.Column[i];
            if (item.Type==REPORT_COLUMN_ID.INDEX_ID) 
                item.TextColor=g_JSChartResource.Report.FieldColor.Index;
            else if (item.Type==REPORT_COLUMN_ID.SYMBOL_ID) 
                item.TextColor=g_JSChartResource.Report.FieldColor.Symbol;
            else if (item.Type==REPORT_COLUMN_ID.NAME_ID) 
                item.TextColor=g_JSChartResource.Report.FieldColor.Name;
            else if (item.Type==REPORT_COLUMN_ID.VOL_ID) 
                item.TextColor=g_JSChartResource.Report.FieldColor.Vol;
            else if (item.Type==REPORT_COLUMN_ID.BUY_VOL_ID) 
                item.TextColor=g_JSChartResource.Report.FieldColor.Vol;
            else if (item.Type==REPORT_COLUMN_ID.SELL_VOL_ID) 
                item.TextColor=g_JSChartResource.Report.FieldColor.Vol;
            else if (item.Type==REPORT_COLUMN_ID.AMOUNT_ID) 
                item.TextColor=g_JSChartResource.Report.FieldColor.Amount;
            else if (item.Type==REPORT_COLUMN_ID.VOL_IN_ID) 
                item.TextColor=g_JSChartResource.Report.DownTextColor;
            else if (item.Type==REPORT_COLUMN_ID.VOL_OUT_ID) 
                item.TextColor=g_JSChartResource.Report.UpTextColor;
            else 
                item.TextColor=g_JSChartResource.Report.FieldColor.Text;
        }

        if (this.Tab) this.Tab.ReloadResource(resource);
    }

    this.SetColumn=function(aryColumn)
    {
        if (!IFrameSplitOperator.IsNonEmptyArray(aryColumn)) return;

        this.Column=[];
        for(var i=0;i<aryColumn.length;++i)
        {
            var item=aryColumn[i];
            var colItem=this.GetDefaultColunm(item.Type);
            if (!colItem) continue;

            if (item.Title) colItem.Title=item.Title;
            if (item.TextAlign) colItem.TextAlign=item.TextAlign;
            if (item.TextColor) colItem.TextColor=item.TextColor;
            if (item.MaxText) colItem.MaxText=item.MaxText;
            if (item.ID) colItem.ID=item.ID;
            if (IFrameSplitOperator.IsNumber(item.Sort)) colItem.Sort=item.Sort;
            if (item.Sort==1 || item.Sort==2)   //1本地排序 2=远程排序
            {
                colItem.SortType=[1,2];         //默认 降序 ，升序
                if (IFrameSplitOperator.IsNonEmptyArray(item.SortType)) colItem.SortType=item.SortType.slice();
            }

            if (item.Type==REPORT_COLUMN_ID.CUSTOM_STRING_TEXT_ID)
            {
                if (!IFrameSplitOperator.IsNumber(item.DataIndex) && !IFrameSplitOperator.IsNumber(item.BlockIndex)) continue;
                if (IFrameSplitOperator.IsNumber(item.DataIndex)) colItem.DataIndex=item.DataIndex;   //数据在扩展数据索引列
                if (IFrameSplitOperator.IsNumber(item.BlockIndex)) colItem.BlockIndex=item.BlockIndex;
                colItem.IsDrawCallback=false;   //是否回调
                if (IFrameSplitOperator.IsBool(item.IsDrawCallback)) colItem.IsDrawCallback=item.IsDrawCallback;
            }
            else if (item.Type==REPORT_COLUMN_ID.CUSTOM_NUMBER_TEXT_ID)
            {
                if (!IFrameSplitOperator.IsNumber(item.DataIndex) && !IFrameSplitOperator.IsNumber(item.BlockIndex)) continue;
                if (IFrameSplitOperator.IsNumber(item.DataIndex)) colItem.DataIndex=item.DataIndex;   //数据在扩展数据索引列
                if (IFrameSplitOperator.IsNumber(item.BlockIndex)) colItem.BlockIndex=item.BlockIndex;
                colItem.Decimal=2;
                colItem.FormatType=0;   //0=默认格式化 1=原始输出 2=科学计数 3=成交量格式化
                colItem.ColorType=0;    //0=默认使用TextColor,  1=（>0涨,<0跌）2=(>昨收涨,<昨收跌)
                colItem.IsDrawCallback=false;   //是否回调
                if (IFrameSplitOperator.IsNumber(item.Decimal)) colItem.Decimal=item.Decimal;            //小数位数
                if (IFrameSplitOperator.IsNumber(item.FormatType)) colItem.FormatType=item.FormatType;   //输出样式
                if (IFrameSplitOperator.IsNumber(item.ColorType)) colItem.ColorType=item.ColorType;      //颜色属性
                if (IFrameSplitOperator.IsBool(item.IsDrawCallback)) colItem.IsDrawCallback=item.IsDrawCallback;
            }
            else if (item.Type==REPORT_COLUMN_ID.CUSTOM_DATETIME_TEXT_ID)
            {
                if (!IFrameSplitOperator.IsNumber(item.DataIndex) && !IFrameSplitOperator.IsNumber(item.BlockIndex)) continue;
                if (IFrameSplitOperator.IsNumber(item.DataIndex)) colItem.DataIndex=item.DataIndex;   //数据在扩展数据索引列
                if (IFrameSplitOperator.IsNumber(item.BlockIndex)) colItem.BlockIndex=item.BlockIndex;
                colItem.FormatType=0;   //0=yyyy-mm-dd 1=YYYY/MM/DD
                colItem.ValueType=0;    //0=yyyymmdd 1=hhmmss
                colItem.IsDrawCallback=false;   //是否回调
                if (IFrameSplitOperator.IsNumber(item.FormatType)) colItem.FormatType=item.FormatType;   //输出样式
                if (IFrameSplitOperator.IsNumber(item.ValueType)) colItem.FormatType=item.ValueType;   //输出样式
                if (IFrameSplitOperator.IsBool(item.IsDrawCallback)) colItem.IsDrawCallback=item.IsDrawCallback;
            }

            this.Column.push(colItem);
        }
    }

    this.GetXScrollPos=function()
    {
        return this.Data.XOffset;
    }

    this.GetXScrollRange=function()
    {
        var maxOffset=this.Column.length-this.FixedColumn-3;
        if (maxOffset<0) return 0;

        return maxOffset;
    }

    this.GetDefaultColunm=function(id)
    {
        var DEFAULT_COLUMN=
        [
            { Type:REPORT_COLUMN_ID.INDEX_ID, Title:"序号", TextAlign:"center", Width:null, TextColor:g_JSChartResource.Report.FieldColor.Index, MaxText:"8888"},
            { Type:REPORT_COLUMN_ID.SYMBOL_ID, Title:"代码", TextAlign:"left", Width:null,  TextColor:g_JSChartResource.Report.FieldColor.Symbol, MaxText:"888888"},
            { Type:REPORT_COLUMN_ID.NAME_ID, Title:"名称", TextAlign:"left", Width:null, TextColor:g_JSChartResource.Report.FieldColor.Name, MaxText:"擎擎擎擎0" },
            { Type:REPORT_COLUMN_ID.SYMBOL_NAME_ID, Title:"股票名称", TextAlign:"left", Width:null, TextColor:g_JSChartResource.Report.FieldColor.Name, MaxText:"擎擎擎擎0"},

            { Type:REPORT_COLUMN_ID.INCREASE_ID, Title:"涨幅%", TextAlign:"right", Width:null, MaxText:"-888.88" },
            { Type:REPORT_COLUMN_ID.PRICE_ID, Title:"现价", TextAlign:"right", Width:null, MaxText:"88888.88" },
            { Type:REPORT_COLUMN_ID.UPDOWN_ID, Title:"涨跌", TextAlign:"right", Width:null, MaxText:"-888.88" },
            { Type:REPORT_COLUMN_ID.AMPLITUDE_ID, Title:"振幅%", TextAlign:"right", Width:null, MaxText:"888.88" },
            { Type:REPORT_COLUMN_ID.BUY_PRICE_ID, Title:"买价", TextAlign:"right", Width:null, MaxText:"88888.88" },
            { Type:REPORT_COLUMN_ID.SELL_PRICE_ID, Title:"卖价", TextAlign:"right", Width:null, MaxText:"88888.88" },
            { Type:REPORT_COLUMN_ID.AVERAGE_PRICE_ID, Title:"均价", TextAlign:"right", Width:null, MaxText:"88888.88" },
            { Type:REPORT_COLUMN_ID.OPEN_ID, Title:"今开", TextAlign:"right", Width:null, MaxText:"88888.88" },
            { Type:REPORT_COLUMN_ID.HIGH_ID, Title:"最高", TextAlign:"right", Width:null, MaxText:"88888.88" },
            { Type:REPORT_COLUMN_ID.LOW_ID, Title:"最低", TextAlign:"right",  Width:null, MaxText:"88888.88" },
            { Type:REPORT_COLUMN_ID.YCLOSE_ID, Title:"昨收", TextAlign:"right",  Width:null, MaxText:"88888.88" },

            { Type:REPORT_COLUMN_ID.VOL_ID, Title:"总量", TextAlign:"right", TextColor:g_JSChartResource.Report.FieldColor.Vol, Width:null, MaxText:"8888.8擎" },
            { Type:REPORT_COLUMN_ID.AMOUNT_ID, Title:"总金额", TextAlign:"right", TextColor:g_JSChartResource.Report.FieldColor.Amount, Width:null, MaxText:"8888.8擎" },
            { Type:REPORT_COLUMN_ID.EXCHANGE_RATE_ID, Title:"换手%", TextAlign:"right", TextColor:g_JSChartResource.Report.FieldColor.Text, Width:null, MaxText:"88.88" },

            { Type:REPORT_COLUMN_ID.OUTSTANDING_SHARES_ID, Title:"流通股本", TextAlign:"right", TextColor:g_JSChartResource.Report.FieldColor.Text, Width:null, MaxText:"8888.8擎" },
            { Type:REPORT_COLUMN_ID.TOTAL_SHARES_ID, Title:"总股本", TextAlign:"right", TextColor:g_JSChartResource.Report.FieldColor.Text, Width:null, MaxText:"8888.8擎" },
            { Type:REPORT_COLUMN_ID.CIRC_MARKET_VALUE_ID, Title:"流通市值", TextAlign:"right", TextColor:g_JSChartResource.Report.FieldColor.Text, Width:null, MaxText:"8888.8擎" },
            { Type:REPORT_COLUMN_ID.MARKET_VALUE_ID, Title:"总市值", TextAlign:"right", TextColor:g_JSChartResource.Report.FieldColor.Text, Width:null, MaxText:"8888.8擎" },

            
            { Type:REPORT_COLUMN_ID.VOL_IN_ID, Title:"内盘", TextAlign:"right", TextColor:g_JSChartResource.Report.DownTextColor, Width:null, MaxText:"8888.8擎" },
            { Type:REPORT_COLUMN_ID.VOL_OUT_ID, Title:"外盘", TextAlign:"right", TextColor:g_JSChartResource.Report.UpTextColor, Width:null, MaxText:"8888.8擎" },


            { Type:REPORT_COLUMN_ID.BUY_VOL_ID, Title:"买量", TextAlign:"right", TextColor:g_JSChartResource.Report.FieldColor.Vol, Width:null, MaxText:"8888.8擎" },
            { Type:REPORT_COLUMN_ID.SELL_VOL_ID, Title:"卖量", TextAlign:"right", TextColor:g_JSChartResource.Report.FieldColor.Vol, Width:null, MaxText:"8888.8擎" },
           
            //{ Type:REPORT_COLUMN_ID.MULTI_BAR_ID, Title:"柱子", TextAlign:"center", Width:null, TextColor:g_JSChartResource.DealList.FieldColor.BarTitle, MaxText:"888888" },
            //{ Type:REPORT_COLUMN_ID.CENTER_BAR_ID, Title:"柱子2", TextAlign:"center", Width:null, TextColor:g_JSChartResource.DealList.FieldColor.BarTitle, MaxText:"888888" },
            { Type:REPORT_COLUMN_ID.CUSTOM_STRING_TEXT_ID, Title:"自定义", TextAlign:"center", Width:null, TextColor:g_JSChartResource.Report.FieldColor.Text, MaxText:"擎擎擎擎擎" },
            { Type:REPORT_COLUMN_ID.CUSTOM_NUMBER_TEXT_ID, Title:"自定义", TextAlign:"center", Width:null, TextColor:g_JSChartResource.Report.FieldColor.Text, MaxText:"擎擎擎擎擎" },
            { Type:REPORT_COLUMN_ID.CUSTOM_DATETIME_TEXT_ID, Title:"自定义", TextAlign:"center", Width:null, TextColor:g_JSChartResource.Report.FieldColor.Text, MaxText:"9999-99-99" },
            
        ];

        for(var i=0;i<DEFAULT_COLUMN.length;++i)
        {
            var item=DEFAULT_COLUMN[i];
            if (item.Type==id) return item;
        }

        return null;
    }


    this.Draw=function()
    {
        this.ShowSymbol=[];

        if (this.SizeChange) this.CalculateSize();
        else this.UpdateCacheData();

        this.Canvas.save();

        this.Canvas.beginPath();
        this.Canvas.rect(this.RectClient.Left,this.RectClient.Top,(this.RectClient.Right-this.RectClient.Left),(this.RectClient.Bottom-this.RectClient.Top));
        //this.Canvas.stroke(); //调试用
        this.Canvas.clip();

        this.DrawHeader();
        this.DrawBody();
        this.Canvas.restore();
        
        if (this.Tab && this.BottomToolbarHeight>0)
        {
            var bottom=this.ChartBorder.GetBottom();
            this.Tab.DrawTab(this.RectClient.Left,bottom-this.BottomToolbarHeight, this.RectClient.Right, bottom)
            this.Tab.DrawScrollbar(this.RectClient.Left,bottom-this.BottomToolbarHeight, this.RectClient.Right, bottom);
        }

        this.DrawBorder();

        this.DrawDragRow();
        
        this.SizeChange=false;
    }

    //更新缓存变量
    this.UpdateCacheData=function()
    {
        this.RectClient.Left=this.ChartBorder.GetLeft();
        this.RectClient.Right=this.ChartBorder.GetRight();
        this.RectClient.Top=this.ChartBorder.GetTop();
        this.RectClient.Bottom=this.ChartBorder.GetBottom()-this.BottomToolbarHeight;
    }

    this.GetPageSize=function(recalculate) //recalculate 是否重新计算
    {
        if (recalculate) this.CalculateSize();
        var size=this.RowCount;
        return size;
    }

    this.GetCurrentPageStatus=function()    //{ Start:起始索引, End:结束索引（数据）, PageSize:页面可以显示几条记录, IsEnd:是否是最后一页, IsSinglePage:是否只有一页数据}
    {
        var result={ Start:this.Data.YOffset, PageSize:this.RowCount, IsEnd:false, SelectedRow:this.SelectedRow, IsSinglePage:false, DataCount:0 };
        if (IFrameSplitOperator.IsNonEmptyArray(this.Data.Data))
        {
            result.End=this.Data.YOffset+this.RowCount-1;
            result.IsSinglePage=this.Data.Data.length<=this.RowCount;
            result.DataCount=this.Data.Data.length;
            if (result.End>=this.Data.Data.length-1) result.IsEnd=true;
            if (result.End>=this.Data.Data.length) result.End=this.Data.Data.length-1;
        }
        else
        {
            result.Star=0;
            result.End=0;
            result.IsEnd=true;
            result.IsSinglePage=true;
        }

        return result;
    }

    this.CalculateSize=function()   //计算大小
    {
        if (this.Tab && this.Tab.IsShow)
        {
            this.Tab.CalculateSize();
            this.BottomToolbarHeight=this.Tab.Height;
        }
        else
        {
            this.BottomToolbarHeight=0;
        }

        this.UpdateCacheData();

        var pixelRatio=GetDevicePixelRatio();
        this.HeaderFont=`${this.HeaderFontConfig.Size*pixelRatio}px ${ this.HeaderFontConfig.Name}`;
        this.ItemFont=`${this.ItemFontConfig.Size*pixelRatio}px ${ this.ItemFontConfig.Name}`;
        this.ItemFixedFont=`${this.ItemFixedFontConfg.Size*pixelRatio}px ${ this.ItemFixedFontConfg.Name}`;
        this.ItemSymbolFont=`${this.ItemSymbolFontConfig.Size*pixelRatio}px ${ this.ItemSymbolFontConfig.Name}`;
        this.ItemNameFont=`${this.ItemNameFontConfg.Size*pixelRatio}px ${ this.ItemNameFontConfg.Name}`;

        this.RowHeight=this.GetFontHeight(this.ItemFont,"擎")+ this.ItemMergin.Top+ this.ItemMergin.Bottom;
        this.FixedRowHeight=this.GetFontHeight(this.ItemFixedFont,"擎")+ this.ItemMergin.Top+ this.ItemMergin.Bottom;

        this.Canvas.font=this.ItemFont;
        var itemWidth=0;
        for(var i=0;i<this.Column.length;++i)
        {
            var item=this.Column[i];
            if (item.Type==REPORT_COLUMN_ID.SYMBOL_NAME_ID)
            {
                this.Canvas.font=this.ItemNameFont;
                var nameWidth=this.Canvas.measureText(item.MaxText).width;
                var nameHeight=this.GetFontHeight(this.ItemNameFont,"擎");
                this.ItemNameHeight=nameHeight;

                this.Canvas.font=this.ItemSymbolFont;
                var symbolWidth=this.Canvas.measureText(item.MaxText).width;
                var symboHeight=this.GetFontHeight(this.ItemSymbolFont,"擎");

                this.Canvas.font=this.ItemFont;

                itemWidth=Math.max(nameWidth, symbolWidth);
                item.Width=itemWidth+4+this.ItemMergin.Left+this.ItemMergin.Right;

                var rowHeight=nameHeight+symboHeight+this.ItemMergin.Top+ this.ItemMergin.Bottom;
                if (rowHeight>this.RowHeight) this.RowHeight=rowHeight;
                if (rowHeight>this.FixedRowHeight) this.FixedRowHeight=rowHeight;
            }
            else
            {
                itemWidth=this.Canvas.measureText(item.MaxText).width;
                item.Width=itemWidth+4+this.ItemMergin.Left+this.ItemMergin.Right;
            }
        }

        this.Canvas.font=this.HeaderFont;
        for(var i=0;i<this.Column.length;++i)
        {
            var item=this.Column[i];
            if (!item.Title || item.Title.length<=0) continue;
            var text=item.Title;
            if (item.Sort>0) text+="↓"; 
            itemWidth=this.Canvas.measureText(text).width;
            itemWidth+=(4+this.HeaderMergin.Left+this.HeaderMergin.Right);
            if (item.Width<itemWidth) item.Width=itemWidth;
        }

        this.HeaderHeight=this.GetFontHeight(this.HeaderFont,"擎")+ this.HeaderMergin.Top+ this.HeaderMergin.Bottom;
        if (!this.IsShowHeader) this.HeaderHeight=0;
        if (this.FixedRowCount<=0) this.FixedRowHeight=0;

        
        this.RowCount=parseInt((this.RectClient.Bottom-this.RectClient.Top-this.HeaderHeight-(this.FixedRowHeight*this.FixedRowCount))/this.RowHeight);

        var subWidth=0;
        var reportWidth=this.RectClient.Right-this.RectClient.Left;
        for(var i=0;i<this.Column.length;++i)
        {
            var item=this.Column[i];
            subWidth+=item.Width;
        }

        this.IsShowAllColumn=(subWidth<reportWidth);
    }

    this.DrawHeader=function()
    {
        if (!this.IsShowHeader) return;

        var left=this.RectClient.Left;
        var top=this.RectClient.Top;
        var y=top+this.HeaderMergin.Top+(this.HeaderHeight-this.HeaderMergin.Top-this.HeaderMergin.Bottom)/2;

        this.Canvas.font=this.HeaderFont;
        this.Canvas.fillStyle=this.HeaderColor;
        
        var textLeft=left;
        //固定列
        for(var i=0;i<this.FixedColumn && i<this.Column.length;++i)
        {
            var item=this.Column[i];
            var itemWidth=item.Width;
            var textWidth=itemWidth-this.HeaderMergin.Left-this.HeaderMergin.Right;
            var x=textLeft+this.HeaderMergin.Left;

            if (this.SortInfo && this.SortInfo.Field==i && this.SortInfo.Sort>0)
            {
                this.DrawSortHeader(item.Title,item.TextAlign,x,y,textWidth,this.SortInfo.Sort);
            }
            else
            {
                this.DrawText(item.Title,item.TextAlign,x,y,textWidth);
            }

            textLeft+=item.Width;
        }

        for(var i=this.FixedColumn+this.Data.XOffset;i<this.Column.length;++i)
        {
            var item=this.Column[i];
            var itemWidth=item.Width;
            var textWidth=itemWidth-this.HeaderMergin.Left-this.HeaderMergin.Right;
            var x=textLeft+this.HeaderMergin.Left;

            if (this.SortInfo && this.SortInfo.Field==i && this.SortInfo.Sort>0)
            {
                this.DrawSortHeader(item.Title,item.TextAlign,x,y,textWidth,this.SortInfo.Sort);
            }
            else
            {
                this.DrawText(item.Title,item.TextAlign,x,y,textWidth);
            }

            textLeft+=item.Width;
        } 
    }

    this.DrawText=function(text, textAlign, x, y, textWidth)
    {
        if (textAlign=='center')
        {
            x=x+textWidth/2;
            this.Canvas.textAlign="center";
        }
        else if (textAlign=='right')
        {
            x=x+textWidth;
            this.Canvas.textAlign="right";
        }
        else
        {
            this.Canvas.textAlign="left";
        }

        this.Canvas.textBaseline="middle";
        this.Canvas.fillText(text,x,y);
    }

    this.DrawSortHeader=function(text, textAlign, x, y, width, sortType)
    {
        var sortText=sortType==1?"↓":"↑";
        var sortTextWidth=this.Canvas.measureText(sortText).width;
        var textWidth=this.Canvas.measureText(text).width+2;
        this.Canvas.textBaseline="middle";
        this.Canvas.textAlign="left";

        if (textAlign=='center')
        {
            x=x+width/2-(sortTextWidth+textWidth)/2;
        }
        else if (textAlign=='right')
        {
            x=(x+width)-sortTextWidth-textWidth;
        }
        else
        {
            
        }

        this.Canvas.fillText(text,x,y);
        this.Canvas.fillStyle=this.SortColor;
        this.Canvas.fillText(sortText,x+textWidth,y);
        this.Canvas.fillStyle=this.HeaderColor;
    }


    this.DrawBorder=function()
    {
        if (!this.IsDrawBorder) return;

        var left=this.RectClient.Left;
        var right=this.RectClient.Right;
        var top=this.RectClient.Top;
        var bottom=this.RectClient.Bottom;

        this.Canvas.strokeStyle=this.BorderColor;
        this.Canvas.beginPath();
       
        this.Canvas.moveTo(left,ToFixedPoint(top+this.HeaderHeight));
        this.Canvas.lineTo(right,ToFixedPoint(top+this.HeaderHeight));

        var rowTop=top+this.HeaderHeight+this.RowHeight;
        var rotBottom=rowTop;
        for(var i=0;i<this.FixedRowCount;++i)
        {
            var drawTop=ToFixedPoint(rowTop);
            this.Canvas.moveTo(left,drawTop);
            this.Canvas.lineTo(right,drawTop);
            rotBottom=rowTop;
            rowTop+=this.FixedRowHeight;
        }

        var rowTop=top+this.HeaderHeight+this.RowHeight+this.FixedRowHeight*this.FixedRowCount;
        var rotBottom=rowTop;
        //横线
        for(var i=0;i<this.RowCount;++i)
        {
            var drawTop=ToFixedPoint(rowTop);
            this.Canvas.moveTo(left,drawTop);
            this.Canvas.lineTo(right,drawTop);
            rotBottom=rowTop;
            rowTop+=this.RowHeight;
        }

        //竖线
        var columnLeft=left;
        for(var i=0;i<this.FixedColumn && i<this.Column.length; ++i)
        {
            var item=this.Column[i];
            var drawLeft=ToFixedPoint(columnLeft+item.Width);
            this.Canvas.moveTo(drawLeft,top);
            this.Canvas.lineTo(drawLeft,rotBottom);

            columnLeft+=item.Width;
        }

        for(var i=this.FixedColumn+this.Data.XOffset;i<this.Column.length;++i)
        {
            var item=this.Column[i];
            var drawLeft=ToFixedPoint(columnLeft+item.Width);
            this.Canvas.moveTo(drawLeft,top);
            this.Canvas.lineTo(drawLeft,rotBottom);

            columnLeft+=item.Width;
        }

        this.Canvas.stroke();
    }

    this.DrawBody=function()
    {
        if (!this.Data) return;
        if (!IFrameSplitOperator.IsNonEmptyArray(this.Data.Data)) return;

        this.Canvas.font=this.ItemFont;
        var top=this.RectClient.Top+this.HeaderHeight;
        var left=this.RectClient.Left;
        var rowWidth=this.RectClient.Right-this.RectClient.Left;

        //固定行
        var textTop=top;
        this.Canvas.font=this.ItemFixedFont;
        for(var i=0; i<this.FixedRowCount; ++i)
        {
            if (this.SelectedFixedRow==i)
            {
                this.Canvas.fillStyle=this.SelectedColor;;
                this.Canvas.fillRect(left,textTop,rowWidth,this.FixedRowHeight);   
            }

            if (this.FixedRowData.Type==1)
                this.DrawFixedSymbolRow(textTop,i);
            else
                this.DrawFixedRow(textTop, i);
            
            textTop+=this.FixedRowHeight;
        }
        

        textTop=top+this.FixedRowHeight*this.FixedRowCount;
        this.Canvas.font=this.ItemFont;
        for(var i=this.Data.YOffset, j=0; i<this.Data.Data.length && j<this.RowCount ;++i, ++j)
        {
            var symbol=this.Data.Data[i];

            var bFillRow=false;
            if (this.SelectedModel==0)
            {
                if (j==this.SelectedRow) bFillRow=true; //选中行
            }
            else
            {
                if (i==this.SelectedRow) bFillRow=true; //选中行
            }

            if (this.DragRow)
            {
                if (this.DragRow.Data)
                {
                    var dataIndex=this.DragRow.Data.Row.DataIndex;
                    if (dataIndex==i)
                    {
                        this.Canvas.fillStyle=this.DragSrcRowColor;
                        this.Canvas.fillRect(left,textTop,rowWidth,this.RowHeight);  
                    }
                }

                if (this.DragRow.MoveRow)
                {
                    var dataIndex=this.DragRow.MoveRow.Data.DataIndex;
                    if (dataIndex==i)
                    {
                        this.Canvas.fillStyle=this.DragMoveRowColor;
                        this.Canvas.fillRect(left,textTop,rowWidth,this.RowHeight);  
                    }
                }

                bFillRow=false;
            }

            if (bFillRow)
            {
                this.Canvas.fillStyle=this.SelectedColor;
                this.Canvas.fillRect(left,textTop,rowWidth,this.RowHeight);   
            }

            this.DrawRow(symbol, textTop, i);

            this.ShowSymbol.push( { Index:i, Symbol:symbol } );

            textTop+=this.RowHeight;
        }
    }


    this.DrawFixedSymbolRow=function(top, dataIndex)
    { 
        var left=this.RectClient.Left;
        var chartRight=this.RectClient.Right;

        if (!this.FixedRowData || !IFrameSplitOperator.IsNonEmptyArray(this.FixedRowData.Symbol)) return;
        var symbol=this.FixedRowData.Symbol[dataIndex];
        if (!symbol) return;

        this.DrawRow(symbol, top, dataIndex, 1);

        this.ShowSymbol.push( { Index:dataIndex, Symbol:symbol, RowType:1 } );
    }


    this.DrawFixedRow=function(top, dataIndex)
    {
        var left=this.RectClient.Left;
        var chartRight=this.RectClient.Right;

        for(var i=0;i<this.FixedColumn && i<this.Column.length;++i)
        {
            var item=this.Column[i];
            this.DrawFixedItem(dataIndex, i, item, left, top);
            left+=item.Width;

            if (left>=chartRight) break;
        }

        for(var i=this.FixedColumn+this.Data.XOffset;i<this.Column.length;++i)
        {
            var item=this.Column[i];
            this.DrawFixedItem(dataIndex, i, item, left, top);
            left+=item.Width;

            if (left>=chartRight) break;
        }
    }

    this.DrawFixedItem=function(dataIndex, colIndex, column, left, top)
    {
        var x=left+this.ItemMergin.Left;
        var textWidth=column.Width-this.ItemMergin.Left-this.ItemMergin.Right;
        var drawInfo={ Text:null, TextColor:column.TextColor , TextAlign:column.TextAlign };

        if (this.GetFixedRowTextDrawInfo(dataIndex, colIndex, column, drawInfo)) 
        {
            this.DrawItemText(drawInfo.Text, drawInfo.TextColor, drawInfo.TextAlign, x, top, textWidth);
            return;
        }

        if (!this.FixedRowData || !IFrameSplitOperator.IsNonEmptyArray(this.FixedRowData.Data)) return;

        var data=this.FixedRowData.Data;
        var rowData=data[dataIndex];
        if (!IFrameSplitOperator.IsNonEmptyArray(rowData)) return;
        var itemData=rowData[colIndex];
        if (!itemData || !itemData.Text) return;

        drawInfo.Text=itemData.Text;
        if (itemData.Color) drawInfo.TextColor=itemData.Color;
        if (itemData.TextAlign) drawInfo.TextAlign=itemData.TextAlign;

        this.DrawItemText(drawInfo.Text, drawInfo.TextColor, drawInfo.TextAlign, x, top, textWidth);
    }

    this.DrawRow=function(symbol, top, dataIndex, rowType)  //rowType 0=表格行 1=顶部固定行 2=拖拽行
    {
        var left=this.RectClient.Left;
        var chartRight=this.RectClient.Right;
        var data= { Symbol:symbol , Stock:null, Block:null };
        if (this.GetStockDataCallback) data.Stock=this.GetStockDataCallback(symbol);
        if (this.GetBlockDataCallback) data.Block=this.GetBlockDataCallback(symbol);
        data.Decimal=GetfloatPrecision(symbol); //小数位数

        for(var i=0;i<this.FixedColumn && i<this.Column.length;++i)
        {
            var item=this.Column[i];
            this.DrawItem(dataIndex, data, item, left, top, rowType);
            left+=item.Width;

            if (left>=chartRight) break;
        }

        for(var i=this.FixedColumn+this.Data.XOffset;i<this.Column.length;++i)
        {
            var item=this.Column[i];
            this.DrawItem(dataIndex, data, item, left, top, rowType);
            left+=item.Width;

            if (left>=chartRight) break;
        }
    }

    this.DrawItem=function(index, data, column, left, top, rowType)
    {
        var itemWidth=column.Width;
        var x=left+this.ItemMergin.Left;
        var textWidth=column.Width-this.ItemMergin.Left-this.ItemMergin.Right;
        var stock=data.Stock;
        var drawInfo={ Text:null, TextColor:column.TextColor , TextAlign:column.TextAlign };
        if (column.Type==REPORT_COLUMN_ID.INDEX_ID)
        {
            if (rowType==1) return; //固定行序号空
            drawInfo.Text=(index+1).toString();
        }
        else if (column.Type==REPORT_COLUMN_ID.SYMBOL_ID)
        {
            if (stock && stock.Symbol) drawInfo.Text=stock.Symbol;
            else drawInfo.Text=data.Symbol;
        }
        else if (column.Type==REPORT_COLUMN_ID.SYMBOL_NAME_ID)
        {
            this.DrawSymbolName(data, column, left, top, rowType);
        }
        else if (column.Type==REPORT_COLUMN_ID.NAME_ID)
        {
            if (stock && stock.Name) 
            {
                drawInfo.Text=this.TextEllipsis(stock.Name, textWidth, column.MaxText);
                drawInfo.TextColor=this.GetNameColor(column,data.Symbol, rowType);
            }
        }
        else if (column.Type==REPORT_COLUMN_ID.PRICE_ID)
        {
            if (stock) this.GetPriceDrawInfo(stock.Price, stock, data, drawInfo);
        }
        else if (column.Type==REPORT_COLUMN_ID.OPEN_ID)
        {
            //如果行情开盘价为涨停价或跌停价,则对内容加灰框
            if (stock) 
            {
                this.DrawLimitPriceBorder(stock.Open, stock, left, top, column.Width);
                this.GetPriceDrawInfo(stock.Open, stock, data, drawInfo);
            }
        }
        else if (column.Type==REPORT_COLUMN_ID.HIGH_ID)
        {
            //如果行情最高价为涨停价,则对内容加灰框
            if (stock) 
            {
                this.DrawLimitPriceBorder(stock.High, stock, left, top, column.Width);
                this.GetPriceDrawInfo(stock.High, stock, data, drawInfo);
            }
        }
        else if (column.Type==REPORT_COLUMN_ID.LOW_ID)
        {
            //如果行情最低价为跌停价,则对内容加灰框
            if (stock) 
            {
                this.DrawLimitPriceBorder(stock.Low, stock, left, top, column.Width);
                this.GetPriceDrawInfo(stock.Low, stock, data, drawInfo);
            }
        }
        else if (column.Type==REPORT_COLUMN_ID.YCLOSE_ID)
        {
            if (stock) this.GetPriceDrawInfo(stock.YClose, stock, data, drawInfo);
        }
        else if (column.Type==REPORT_COLUMN_ID.BUY_PRICE_ID)
        {
            if (stock) this.GetPriceDrawInfo(stock.BuyPrice, stock, data, drawInfo);
        }
        else if (column.Type==REPORT_COLUMN_ID.SELL_PRICE_ID)
        {
            if (stock) this.GetPriceDrawInfo(stock.SellPrice, stock, data, drawInfo);
        }
        else if (column.Type==REPORT_COLUMN_ID.AVERAGE_PRICE_ID)
        {
            if (stock) this.GetPriceDrawInfo(stock.AvPrice, stock, data, drawInfo);
        }
        else if (column.Type==REPORT_COLUMN_ID.EXCHANGE_RATE_ID)
        {
            if (stock && IFrameSplitOperator.IsNumber(stock.Exchange))
                drawInfo.Text=stock.Exchange.toFixed(2);
        }
        else if (column.Type==REPORT_COLUMN_ID.BUY_VOL_ID)
        {
            if (stock && IFrameSplitOperator.IsNumber(stock.BuyVol)) drawInfo.Text=this.FormatVolString(stock.BuyVol);
        }
        else if (column.Type==REPORT_COLUMN_ID.SELL_VOL_ID)
        {
            if (stock && IFrameSplitOperator.IsNumber(stock.SellVol)) drawInfo.Text=this.FormatVolString(stock.SellVol);
        }
        else if (column.Type==REPORT_COLUMN_ID.VOL_ID)
        {
            if (stock && IFrameSplitOperator.IsNumber(stock.Vol)) drawInfo.Text=this.FormatVolString(stock.Vol);
        }
        else if (column.Type==REPORT_COLUMN_ID.VOL_IN_ID)
        {
            if (stock && IFrameSplitOperator.IsNumber(stock.VolIn)) drawInfo.Text=this.FormatVolString(stock.VolIn);
        }
        else if (column.Type==REPORT_COLUMN_ID.VOL_OUT_ID)
        {
            if (stock && IFrameSplitOperator.IsNumber(stock.VolOut)) drawInfo.Text=this.FormatVolString(stock.VolOut);
        }
        else if (column.Type==REPORT_COLUMN_ID.TOTAL_SHARES_ID)
        {
            if (stock && IFrameSplitOperator.IsNumber(stock.TotalShares)) drawInfo.Text=this.FormatVolString(stock.TotalShares);
        }
        else if (column.Type==REPORT_COLUMN_ID.OUTSTANDING_SHARES_ID)
        {
            if (stock && IFrameSplitOperator.IsNumber(stock.OutShares)) drawInfo.Text=this.FormatVolString(stock.OutShares);
        }
        else if (column.Type==REPORT_COLUMN_ID.CIRC_MARKET_VALUE_ID || column.Type==REPORT_COLUMN_ID.MARKET_VALUE_ID || column.Type==REPORT_COLUMN_ID.AMOUNT_ID)
        {
            var fieldName=MAP_COLUMN_FIELD.get(column.Type);
            if (stock && IFrameSplitOperator.IsNumber(stock[fieldName])) 
                drawInfo.Text=this.FormatVolString(stock[fieldName]);
        }
        else if (column.Type==REPORT_COLUMN_ID.INCREASE_ID || column.Type==REPORT_COLUMN_ID.AMPLITUDE_ID || column.Type==REPORT_COLUMN_ID.UPDOWN_ID)
        {
            var fieldName=MAP_COLUMN_FIELD.get(column.Type);
            if (stock && IFrameSplitOperator.IsNumber(stock[fieldName]))
            {
                var value=stock[fieldName];
                drawInfo.Text=value.toFixed(2);
                drawInfo.TextColor=this.GetUpDownColor(value,0);
            }
        }
        else if (column.Type==REPORT_COLUMN_ID.CUSTOM_STRING_TEXT_ID)
        {
            this.GetCustomStringDrawInfo(data, column, drawInfo);
        }
        else if (column.Type==REPORT_COLUMN_ID.CUSTOM_NUMBER_TEXT_ID)
        {
            this.GetCustomNumberDrawInfo(data, column, drawInfo);
        }
        else if (column.Type==REPORT_COLUMN_ID.CUSTOM_DATETIME_TEXT_ID)
        {
            this.GetCustomDateTimeDrawInfo(data, column, drawInfo);
        }

        //拖拽行颜色
        if (rowType==3) 
            drawInfo.TextColor=this.DragRowTextColor;

        this.DrawItemText(drawInfo.Text, drawInfo.TextColor, drawInfo.TextAlign, x, top, textWidth);
    }

    this.DrawSymbolName=function(data, column, left, top, rowType)
    {
        var stock=data.Stock;
        var symbol=data.Symbol;
        var name;
        if (stock)
        {
            symbol=stock.Symbol;
            name=stock.Name;
        }

        if (!symbol && !name) return;

        var y=top+this.ItemMergin.Top+this.ItemNameHeight;
        var textLeft=left+this.ItemMergin.Left;
        var x=textLeft;
        var width=column.Width-this.ItemMergin.Left-this.ItemMergin.Right;
        var textAlign=column.TextAlign;
        if (textAlign=='center')
        {
            x=textLeft+width/2;
            this.Canvas.textAlign="center";
        }
        else if (textAlign=='right')
        {
            x=textLeft+width-2;
            this.Canvas.textAlign="right";
        }
        else
        {
            x+=2;
            this.Canvas.textAlign="left";
        }

        var textColor=this.GetNameColor(column,symbol,rowType);
        var text=name;
        if (text)
        {
            this.Canvas.textBaseline="ideographic";
            this.Canvas.fillStyle=textColor;
            this.Canvas.font=this.ItemNameFont;
            text=this.TextEllipsis(text, width, column.MaxText);
            if (text) this.Canvas.fillText(text,x,y);
        }
       
        text=symbol;
        if (text)
        {
            this.Canvas.textBaseline="top";
            this.Canvas.font=this.ItemSymbolFont;
            this.Canvas.fillStyle=textColor;
            this.Canvas.fillText(text,x,y);
        }
        
        this.Canvas.font=this.ItemFont; //还原字体
    }

    this.DrawLimitPriceBorder=function(value, stock, left, top, itemWidth)
    {
        if (!IFrameSplitOperator.IsNumber(value) || !stock) return;

        var bDraw=false;
        if (IFrameSplitOperator.IsNumber(stock.LimitHigh))
        {
            if (value>=stock.LimitHigh) bDraw=true;
        }

        if (IFrameSplitOperator.IsNumber(stock.LimitLow))
        {
            if (value<=stock.LimitLow) bDraw=true;
        }

        if (!bDraw) return;

        var x=left+this.ItemMergin.Left+this.LimitMergin.Left;
        var width=itemWidth-this.ItemMergin.Left-this.ItemMergin.Right-this.LimitMergin.Left-this.LimitMergin.Right;
        var y=top+this.ItemMergin.Top+this.LimitMergin.Top;
        var height=this.RowHeight-this.ItemMergin.Top-this.ItemMergin.Bottom-this.LimitMergin.Top-this.LimitMergin.Bottom;

        this.Canvas.strokeStyle=this.LimitBorderColor;
        this.Canvas.strokeRect(ToFixedPoint(x),ToFixedPoint(y),ToFixedRect(width),ToFixedRect(height));
    }

    this.GetExtendData=function(data, column)
    {
        if (IFrameSplitOperator.IsNumber(column.DataIndex))
        {
            if (!data.Stock || !data.Stock.ExtendData) return null;
            if (column.DataIndex<0) return;
            return data.Stock.ExtendData[column.DataIndex];
        }

        if (IFrameSplitOperator.IsNumber(column.BlockIndex))
        {
            if (!data.Block) return;
            if (column.BlockIndex<0) return;
            return data.Block[column.BlockIndex];
        }
        
        return null;
    }

    this.GetCustomStringDrawInfo=function(data, column, drawInfo)
    {
        var value=this.GetExtendData(data, column);
        if (!IFrameSplitOperator.IsString(value)) return;

        if (column.IsDrawCallback)  //外部处理输出格式
        {
            this.GetCustomTextDrawInfo(column, data.Symbol, value, drawInfo, data);
            return;
        }

        drawInfo.Text=value;
    }

    this.GetCustomNumberDrawInfo=function(data, column, drawInfo)
    {
        var value=this.GetExtendData(data, column);
        if (!IFrameSplitOperator.IsNumber(value)) return;

        if (column.IsDrawCallback)  //外部处理输出格式
        {
            this.GetCustomTextDrawInfo(column, data.Symbol, value, drawInfo, data);
            return;
        }

        //格式化输出
        switch(column.FormatType)
        {
            case 1:
                drawInfo.Text=value.toFixed(column.Decimal);
                break;
            case 2:
                drawInfo.Text=IFrameSplitOperator.FormatValueThousandsString(value, column.Decimal);
                break;
            case 3:
                drawInfo.Text=this.FormatVolString(value);
                break;
            default:
                drawInfo.Text=IFrameSplitOperator.FormatValueString(value, column.Decimal);
                break;
        }  

        //颜色
        switch(column.ColorType)
        {
            case 1:
                drawInfo.TextColor=this.GetUpDownColor(value,0);
                break;
            case 2:
                if (!IFrameSplitOperator.IsNumber(data.Stock.YClose))  
                    drawInfo.TextColor=this.UnchagneColor;
                else  
                    drawInfo.TextColor=this.GetUpDownColor(value, data.Stock.YClose);
                break;
            default:
                break;
        }
    }

    this.GetCustomDateTimeDrawInfo=function(data, column, drawInfo)
    {
        var value=this.GetExtendData(data, column);
        if (!IFrameSplitOperator.IsNumber(value)) return;

        if (column.IsDrawCallback)  //外部处理输出格式
        {
            this.GetCustomTextDrawInfo(column, data.Symbol, value, drawInfo, data);
            return;
        }

        if (column.ValueType==0)
        {
            if (column.FormatType==1)
                drawInfo.Text=IFrameSplitOperator.FormatDateString(value,"YYYY/MM/DD");
            else
                drawInfo.Text=IFrameSplitOperator.FormatDateString(value);
        }
    }

    this.GetPriceDrawInfo=function(price, stock, data, drawInfo)
    {
        if (!IFrameSplitOperator.IsNumber(price)) return false;

        drawInfo.Text=price.toFixed(data.Decimal);
        if (!IFrameSplitOperator.IsNumber(stock.YClose))  
            drawInfo.TextColor=this.UnchagneColor;
        else  
            drawInfo.TextColor=this.GetUpDownColor(price, stock.YClose);
    }

    this.GetUpDownColor=function(price, price2)
    {
        if (price>price2) return this.UpColor;
        else if (price<price2) return this.DownColor;
        else return this.UnchagneColor;
    }

    //单独处理成交量显示
    this.FormatVolString=function(value,languageID)
    {
        return IFrameSplitOperator.FormatVolString(value, languageID);
    }

    this.DrawItemText=function(text, textColor, textAlign, left, top, width)
    {
        if (!text) return;

        var x=left;
        if (textAlign=='center')
        {
            x=left+width/2;
            this.Canvas.textAlign="center";
        }
        else if (textAlign=='right')
        {
            x=left+width-2;
            this.Canvas.textAlign="right";
        }
        else
        {
            x+=2;
            this.Canvas.textAlign="left";
        }

        this.Canvas.textBaseline="middle";
        this.Canvas.fillStyle=textColor;
        this.Canvas.fillText(text,x,top+this.ItemMergin.Top+this.RowHeight/2);
    }

    //字体由外面设置
    this.TextEllipsis=function(text, maxWidth, maxText)
    {
        if (!text) return null;
        
        if (text.length<maxText.length) return text;

        var start=maxText.length-3;
        if (start<0) return null;
        var newText=text.slice(0,start);
        for(var i=start;i<text.length;++i)
        {
            var value=newText + text[i] + "...";
            var width=this.Canvas.measureText(value).width;
            if (width>maxWidth) 
            {
                newText+="...";
                break;
            }
            newText+=text[i];
        }

        return newText;
    }

    this.DrawMultiBar=function(colunmInfo, data, rtItem)
    {
        if (!data.Source || !IFrameSplitOperator.IsNonEmptyArray(data.Source)) return false;
        var barData=data.Source[colunmInfo.DataIndex]; //{ Value:[0.4,0,2], Color:[0,1] };
        if (!barData) return false;
        if (!IFrameSplitOperator.IsNonEmptyArray(barData.Value)) return false;

        var width=rtItem.Width-this.BarMergin.Left-this.BarMergin.Right;
        var left=rtItem.Left+this.BarMergin.Left;
        var top=rtItem.Top+this.RowMergin.Top+this.BarMergin.Top;
        var height=rtItem.Height-this.RowMergin.Top-this.RowMergin.Bottom-this.BarMergin.Top-this.BarMergin.Bottom;
        var right=left+width;
        for(var i=0;i<barData.Value.length;++i)
        {
            var value=barData.Value[i];
            if (value<=0) continue;
            if (left>=right) break;

            var barWidth=width*value;
            if (barWidth<1) barWidth=1;
            if (left+barWidth>right) barWidth=right-left;

            var colorIndex=i;
            if (IFrameSplitOperator.IsNonEmptyArray(barData.Color) && i<barData.Color.length) colorIndex= barData.Color[i];

            this.Canvas.fillStyle=g_JSChartResource.DealList.FieldColor.Bar[colorIndex];
            this.Canvas.fillRect(left,top,barWidth,height);

            left+=barWidth;
        }
        return true;
    }

    this.DrawCenterBar=function(colunmInfo, data, rtItem)
    {
        if (!data.Source || !IFrameSplitOperator.IsNonEmptyArray(data.Source)) return false;
        var barData=data.Source[colunmInfo.DataIndex]; //{ Value:[0.4,0,2], Color:[0,1] };
        if (!barData) return false;
        if (!IFrameSplitOperator.IsNonEmptyArray(barData.Value)) return false;

        var width=(rtItem.Width-this.BarMergin.Left-this.BarMergin.Right)/2;
        var left=rtItem.Left+this.BarMergin.Left;
        var center=left+width;
        var top=rtItem.Top+this.RowMergin.Top+this.BarMergin.Top;
        var height=rtItem.Height-this.RowMergin.Top-this.RowMergin.Bottom-this.BarMergin.Top-this.BarMergin.Bottom;
        var right=left+width;

        for(var i=0;i<barData.Value.length && i<2;++i)
        {
            var value=barData.Value[i];
            if (value<=0) continue;

            if (value>1) value=1;
            var barWidth=width*value;
            if (barWidth<1) barWidth=1;

            var colorIndex=i;
            if (IFrameSplitOperator.IsNonEmptyArray(barData.Color) && i<barData.Color.length) colorIndex= barData.Color[i];
            this.Canvas.fillStyle=g_JSChartResource.DealList.FieldColor.Bar[colorIndex];

            if (i==0)  //左边
            {
                this.Canvas.fillRect(center,top,-barWidth,height);
            }
            else    //右边
            {
                this.Canvas.fillRect(center,top,barWidth,height);
            }
        }
    }

    //外部配置显示格式 颜色 对齐方式
    this.GetCustomTextDrawInfo=function(columnInfo, symbol, value, drawInfo, data)
    {
        var event=this.GetEventCallback(JSCHART_EVENT_ID.ON_DRAW_CUSTOM_TEXT);
        if (!event || !event.Callback) return false;

        var sendData=
        { 
            Symbol:symbol, Column:columnInfo, Value:value, Data:data,
            Out:{ Text:null, TextColor:null, TextAlign:null } 
        };

        event.Callback(event,sendData,this);

        if (sendData.Out.Text) drawInfo.Text=sendData.Out.Text;
        if (sendData.Out.TextColor) drawInfo.TextColor=sendData.Out.TextColor;
        if (sendData.Out.TextAlign) drawInfo.TextAlign=sendData.Out.TextAlign;

        return true;
    }

    this.GetFixedRowTextDrawInfo=function(rowIndex, colIndex, columnInfo, drawInfo)
    {
        var event=this.GetEventCallback(JSCHART_EVENT_ID.ON_DRAW_REPORT_FIXEDROW_TEXT);
        if (!event || !event.Callback) return false;

        var sendData=
        { 
            RowIndex:rowIndex, ColIndex:colIndex, Column:columnInfo, Data:this.FixedRowData,
            Out:{ Text:null, TextColor:null, TextAlign:null } 
        };

        event.Callback(event,sendData,this);

        if (sendData.Out.Text) drawInfo.Text=sendData.Out.Text;
        if (sendData.Out.TextColor) drawInfo.TextColor=sendData.Out.TextColor;
        if (sendData.Out.TextAlign) drawInfo.TextAlign=sendData.Out.TextAlign;

        return true;
        
    }

    this.GetVolColor=function(colunmInfo, data)
    {
        var event=this.GetEventCallback(JSCHART_EVENT_ID.ON_DRAW_DEAL_VOL_COLOR);
        if (event && event.Callback)
        {
            var sendData={ Data:data, TextColor:null };
            event.Callback(event,sendData,this);
            if (sendData.TextColor) return sendData.TextColor;
        }

        return colunmInfo.TextColor;
    }

    //获取股票名称颜色
    this.GetNameColor=function(colunmInfo, symbol, rowType)
    {
        var event=this.GetEventCallback(JSCHART_EVENT_ID.ON_DRAW_REPORT_NAME_COLOR);
        if (event && event.Callback)
        {
            var sendData={ Symbol:symbol, TextColor:null, RowType:rowType };
            event.Callback(event,sendData,this);
            if (sendData.TextColor) return sendData.TextColor;
        }

        return colunmInfo.TextColor;
    }

    this.GetFontHeight=function(font,word)
    {
        return GetFontHeight(this.Canvas, font, word);
    }

    this.OnMouseDown=function(x,y,e)    //Type: 1=tab  4=固定行 2=行 3=表头
    {
        if (!this.Data) return null;

        if (this.Tab)
        {
            var tab=this.Tab.OnMouseDown(x,y,e);
            if (tab) return { Type:1, Tab: tab };   //底部工具栏
        }

        var pixelTatio = GetDevicePixelRatio();
        var insidePoint={X:x/pixelTatio, Y:y/pixelTatio};

        if (this.UIElement)
            var uiElement={Left:this.UIElement.getBoundingClientRect().left, Top:this.UIElement.getBoundingClientRect().top};
        else
            var uiElement={Left:null, Top:null};

        var row=this.PtInFixedBody(x,y)
        if (row)
        {
            var bRedraw=true;
            var eventID=JSCHART_EVENT_ID.ON_CLICK_REPORT_FIXEDROW;
            if (e.button==2) eventID=JSCHART_EVENT_ID.ON_RCLICK_REPORT_FIXEDROW;
            this.SendClickEvent(eventID, { Data:row, X:x, Y:y, e:e, Inside:insidePoint, UIElement:uiElement });

            this.SelectedFixedRow=row.Index;
            this.SelectedRow=-1;

            return { Type:4, Redraw:bRedraw, Row:row };  //行
        }

        var row=this.PtInBody(x,y);
        if (row)
        {
            var bRedraw=true;
            if (this.SelectedModel==0) 
            {
                if (this.SelectedRow==row.Index) bRedraw=false;
                this.SelectedRow=row.Index;
                this.SelectedFixedRow=-1;
            }
            else 
            {
                if (this.SelectedRow==row.DataIndex) bRedraw=false;
                this.SelectedRow=row.DataIndex;
                this.SelectedFixedRow=-1;
            }
    
            var eventID=JSCHART_EVENT_ID.ON_CLICK_REPORT_ROW;
            if (e.button==2) eventID=JSCHART_EVENT_ID.ON_RCLICK_REPORT_ROW;
            
            this.SendClickEvent(eventID, { Data:row, X:x, Y:y, e:e, Inside:insidePoint, UIElement:uiElement });

            return { Type:2, Redraw:bRedraw, Row:row };  //行
        }

        var header=this.PtInHeader(x,y);
        if (header)
        {
            var eventID=JSCHART_EVENT_ID.ON_CLICK_REPORT_HEADER;
            if (e.button==2) 
            {
                eventID=JSCHART_EVENT_ID.ON_RCLICK_REPORT_HEADER;
            }
            else if (e.button==0)
            {
                eventID=JSCHART_EVENT_ID.ON_CLICK_REPORT_HEADER;
            }

            this.SendClickEvent(eventID, { Data:row, X:x, Y:y , e:e, Inside:insidePoint, UIElement:uiElement});
            return { Type:3, Redraw:bRedraw, Header:header };  //表头
        }

        return null;
    }

    this.OnDrawgRow=function(x, y, e) //Type: 5=顶部  6=空白行 2=行 7=底部
    {
        if (!this.Data) return null;
        if (!IFrameSplitOperator.IsNonEmptyArray(this.Data.Data)) return null;

        var topOffset=this.RowHeight/2;
        var top=this.RectClient.Top+this.HeaderHeight;
        var right=this.ChartBorder.GetChartWidth();
        var textTop=top+this.FixedRowHeight*this.FixedRowCount;

        if (y<textTop+topOffset) return { Type:5 };


        for(var i=this.Data.YOffset, j=0; i<this.Data.Data.length && j<this.RowCount ;++i, ++j)
        {
            var symbol=this.Data.Data[i];
            var rtRow={ Left:0, Top:textTop, Right:right, Bottom: textTop+this.RowHeight };
            rtRow.Top+=topOffset;
            rtRow.Bottom+=topOffset;

            if (x>=rtRow.Left && x<=rtRow.Right && y>=rtRow.Top && y<=rtRow.Bottom)
            {
                var data={ DataIndex:i, Index:j , Symbol:symbol, Pos:0 };
                if (j==0) data.Pos=1;
                else if (j==this.RowCount-1) data.Pos=2;
                return { Type: 2, Data:data };
            }

            textTop+=this.RowHeight;
        }

        if (j<this.RowCount) return { Type:6 };

        return { Type:7 };
    }

    this.OnDblClick=function(x,y,e)
    {
        if (!this.Data) return false;

        var row=this.PtInBody(x,y);
        if (row)
        {
            this.SendClickEvent(JSCHART_EVENT_ID.ON_DBCLICK_REPORT_ROW, { Data:row, X:x, Y:y });
            return true;
        }

        return false;
    }

    this.PtInBody=function(x,y)
    {
        if (!this.Data) return null;
        if (!IFrameSplitOperator.IsNonEmptyArray(this.Data.Data)) return null;

        var top=this.RectClient.Top+this.HeaderHeight;
        var left=this.RectClient.Left;
        var right=this.RectClient.Right;
        var rowWidth=this.RectClient.Right-this.RectClient.Left;
 
        var textTop=top+this.FixedRowHeight*this.FixedRowCount;
        for(var i=this.Data.YOffset, j=0; i<this.Data.Data.length && j<this.RowCount ;++i, ++j)
        {
            var symbol=this.Data.Data[i];
            var rtRow={ Left:left, Top:textTop, Right:right, Bottom: textTop+this.RowHeight };

            if (x>=rtRow.Left && x<=rtRow.Right && y>=rtRow.Top && y<=rtRow.Bottom)
            {
                var data={ Rect:rtRow, DataIndex:i, Index:j , Symbol:symbol };
                data.Item=this.PtInItem(x,y, rtRow.Top, rtRow.Bottom);
                return data;
            }

            textTop+=this.RowHeight;
        }

        return null;
    }

    this.PtInFixedBody=function(x,y)
    {
        if (this.FixedRowCount<=0) return null;

        var top=this.RectClient.Top+this.HeaderHeight;
        var left=this.RectClient.Left;
        var right=this.RectClient.Right;
        var rowWidth=this.RectClient.Right-this.RectClient.Left;

        var textTop=top;
        for(var i=0; i<this.FixedRowCount; ++i)
        {
            var rtRow={ Left:left, Top:textTop, Right:right, Bottom: textTop+this.FixedRowHeight };

            if (x>=rtRow.Left && x<=rtRow.Right && y>=rtRow.Top && y<=rtRow.Bottom)
            {
                var data={ Rect:rtRow, Index:i};
                data.Item=this.PtInItem(x,y, rtRow.Top, rtRow.Bottom);
                return data;
            }

            textTop+=this.FixedRowHeight;
        }

        return null;

    }

    this.PtInItem=function(x,y, top, bottom)
    {
        var left=this.RectClient.Left;
        var right=this.RectClient.Right;

        var textLeft=left;
        //固定列
        for(var i=0;i<this.FixedColumn && i<this.Column.length;++i)
        {
            var item=this.Column[i];
            var header={Left:textLeft, Right:textLeft+item.Width, Top:top, Bottom:bottom };

            if (x>=header.Left && x<=header.Right && y>=header.Top && y<=header.Bottom)
            {
                return { Rect:header, Column:item, Index:i };
            }

            textLeft+=item.Width;
        }

        for(var i=this.FixedColumn+this.Data.XOffset;i<this.Column.length;++i)
        {
            var item=this.Column[i];
            if (textLeft>=right) break;
            
            var header={Left:textLeft, Right:textLeft+item.Width, Top:top, Bottom:bottom };

            if (x>=header.Left && x<=header.Right && y>=header.Top && y<=header.Bottom)
            {
                return { Rect:header, Column:item, Index:i };
            }
            textLeft+=item.Width;
        } 

        return null;
    }

    this.PtInHeader=function(x,y)
    {
        if (!this.IsShowHeader) return null;

        var left=this.RectClient.Left;
        var right=this.RectClient.Right;
        var top=this.RectClient.Top;
        var bottom=top+this.HeaderHeight;

        if (!(x>=left && x<=right && y>=top && y<=bottom)) return null;

        return this.PtInItem(x,y,top,bottom);
    }

    this.IsPtInBody=function(x,y)
    {
        var top=this.RectClient.Top+this.HeaderHeight;
        var left=this.RectClient.Left;
        var right=this.RectClient.Right;
        var bottom=this.RectClient.Bottom;

        if (x>=left && x<=right && y>=top && y<=bottom) return true;

        return false;
    }

    this.IsPtInHeader=function(x,y)
    {
        if (!this.IsShowHeader) return false;

        var left=this.RectClient.Left;
        var right=this.RectClient.Right;
        var top=this.RectClient.Top;
        var bottom=top+this.HeaderHeight;

        if (x>=left && x<=right && y>=top && y<=bottom) return true;

        return false;
    }

    this.SendClickEvent=function(id, data)
    {
        var event=this.GetEventCallback(id);
        if (event && event.Callback)
        {
            event.Callback(event,data,this);
        }
    }

    this.DrawDragRow=function()
    {
        if (!this.DragRow) return;
        var drag=this.DragRow;

        if (!drag.Data || !drag.Inside || !drag.Data.Row) return;
        var dataIndex=drag.Data.Row.DataIndex;

        if (!IFrameSplitOperator.IsNumber(dataIndex) || dataIndex<0) return;
        
        var textTop=drag.Inside.Y-(this.RowHeight/2);
        var top=textTop;
        var left=this.RectClient.Left;
        var rowWidth=this.RectClient.Right-this.RectClient.Left;

        //背景
        this.Canvas.fillStyle=this.DragRowColor;
        this.Canvas.fillRect(left,textTop,rowWidth,this.RowHeight);   

        var symbol=this.Data.Data[dataIndex];
        var data= { Symbol:symbol , Stock:null, Block:null };
        if (this.GetStockDataCallback) data.Stock=this.GetStockDataCallback(symbol);
        if (this.GetBlockDataCallback) data.Block=this.GetBlockDataCallback(symbol);
        data.Decimal=GetfloatPrecision(symbol); //小数位数
        var chartRight=this.RectClient.Right;

        this.Canvas.font=this.ItemFont;
        for(var i=0;i<this.FixedColumn && i<this.Column.length;++i)
        {
            var item=this.Column[i];
            this.DrawItem(dataIndex, data, item, left, top, 3);
            left+=item.Width;

            if (left>=chartRight) break;
        }

        for(var i=this.FixedColumn+this.Data.XOffset;i<this.Column.length;++i)
        {
            var item=this.Column[i];
            this.DrawItem(dataIndex, data, item, left, top, 3);
            left+=item.Width;

            if (left>=chartRight) break;
        }

    }
}

//报价列表底部tab和横向滚动条
function ChartReportTab()
{
    this.Canvas;                        //画布
    this.ChartBorder;                   //边框信息
    this.ChartFrame;                    //框架画法
    this.Name;                          //名称
    this.ClassName='ChartReportTab';       //类名
    this.IsDrawFirst=false;
    this.GetEventCallback;              //获取事件

    this.Report;

    this.IsShow=true;                   //是否显示

    //Tab
    this.TabList=[];                //{ Title:标题, ID:, IsMenu: 是否菜单 }
    this.SelectedTabIndex=-1;
    this.MoveOnTabIndex=-1;
    
    //滚动条信息
    this.MaxPos=15;             //滚动条可移动长度
    this.CurrentPos=15;         //当前滚动条移动位置
    this.Step=1;                //滚动条移动步长
    this.ScrollBarWidth=g_JSChartResource.Report.Tab.ScrollBarWidth;
    this.ButtonColor=g_JSChartResource.Report.Tab.ButtonColor;
    this.BarColor=g_JSChartResource.Report.Tab.BarColor;
    this.BorderColor=g_JSChartResource.Report.Tab.BorderColor;
    this.Mergin={ Left:2, Right:2, Top:2, Bottom:2 };

    this.TabFontConfig={ Size:g_JSChartResource.Report.Tab.Font.Size, Name:g_JSChartResource.Report.Tab.Font.Name };
    this.TabFont;
    this.TabTitleColor=g_JSChartResource.Report.Tab.TabTitleColor;
    this.TabSelectedTitleColor=g_JSChartResource.Report.Tab.TabSelectedTitleColor;
    this.TabSelectedBGColor=g_JSChartResource.Report.Tab.TabSelectedBGColor;
    this.TabMoveOnTitleColor=g_JSChartResource.Report.Tab.TabMoveOnTitleColor;
    this.TabBGColor=g_JSChartResource.Report.Tab.TabBGColor;
    this.TabMergin=
    { 
        Top:g_JSChartResource.Report.Tab.Mergin.Top, 
        Left:g_JSChartResource.Report.Tab.Mergin.Left, 
        Right:g_JSChartResource.Report.Tab.Mergin.Right,
        Bottom:g_JSChartResource.Report.Tab.Mergin.Bottom
    };

    this.Height;
    this.ButtonSize=25;
    this.TabWidth=0;

    this.RectScroll={ Left:null, Right:null, Bar:null, Client:null };   //滚动条区域    

    this.ReloadResource=function(resource)
    {
        //滚动条
        this.ScrollBarWidth=g_JSChartResource.Report.Tab.ScrollBarWidth;
        this.ButtonColor=g_JSChartResource.Report.Tab.ButtonColor;
        this.BarColor=g_JSChartResource.Report.Tab.BarColor;
        this.BorderColor=g_JSChartResource.Report.Tab.BorderColor;

        //tab
        this.TabFontConfig={ Size:g_JSChartResource.Report.Tab.Font.Size, Name:g_JSChartResource.Report.Tab.Font.Name };
        this.TabTitleColor=g_JSChartResource.Report.Tab.TabTitleColor;
        this.TabSelectedTitleColor=g_JSChartResource.Report.Tab.TabSelectedTitleColor;
        this.TabSelectedBGColor=g_JSChartResource.Report.Tab.TabSelectedBGColor;
        this.TabMoveOnTitleColor=g_JSChartResource.Report.Tab.TabMoveOnTitleColor;
        this.TabBGColor=g_JSChartResource.Report.Tab.TabBGColor;
        this.TabMergin=
        { 
            Top:g_JSChartResource.Report.Tab.Mergin.Top, 
            Left:g_JSChartResource.Report.Tab.Mergin.Left, 
            Right:g_JSChartResource.Report.Tab.Mergin.Right,
            Bottom:g_JSChartResource.Report.Tab.Mergin.Bottom
        };
    }

    this.SetTabList=function(aryTab)
    {
        this.TabList=[];
        for(var i=0;i<aryTab.length;++i)
        {
            var item=aryTab[i];
            if (!item.Title) continue;

            var tabItem={ Title:item.Title, IsMenu:false, FixedSymbol:[], FixedRowCount:0 };
            if (item.ID) tabItem.ID=item.ID;
            if (item.MenuID) tabItem.MenuID=item.MenuID;
            if (IFrameSplitOperator.IsBool(item.IsMenu)) tabItem.IsMenu=item.IsMenu;
            if (IFrameSplitOperator.IsNonEmptyArray(item.FixedSymbol))
            {
                for(var j=0;j<item.FixedSymbol.length;++j)
                {
                    var stockItem=item.FixedSymbol[j];
                    if (!stockItem || !stockItem.Symbol) continue;
                    tabItem.FixedSymbol.push(stockItem);
                    ++tabItem.FixedRowCount;
                }
            }
            this.TabList.push(tabItem);
        }
    }

    this.CalculateSize=function()   //计算大小
    {
        var pixelRatio=GetDevicePixelRatio();
        this.TabFont=`${this.TabFontConfig.Size*pixelRatio}px ${ this.TabFontConfig.Name}`;
        this.Height=this.GetFontHeight(this.TabFont,"8")+ this.Mergin.Top+ this.Mergin.Bottom;
        var buttonSize=Math.min(25, this.Height-this.Mergin.Top-this.Mergin.Bottom);
        this.ButtonSize=buttonSize;
    }

    this.DrawScrollbar=function(left, top, right, bottom)
    {
        this.RectScroll={ Left:null, Right:null, Bar:null, Client:null };
        var columnOffset = this.Report.GetXScrollPos();
	    var clolumCount =this.Report.GetXScrollRange();
	    if (clolumCount <= 0) return;
        if (this.Report.IsShowAllColumn) return;

        var left=left+this.TabWidth;
        if (left+this.ScrollBarWidth*2>right) return;

        this.MaxPos=clolumCount;
        this.CurrentPos=columnOffset;

        var buttonSize=this.ButtonSize;

        var rtLeft={ Left:left+this.Mergin.Left, Top:bottom-buttonSize-this.Mergin.Bottom, Width:buttonSize, Height:buttonSize };
        rtLeft.Right=rtLeft.Left+buttonSize;
        rtLeft.Bottom=rtLeft.Top+buttonSize;

        var rtRight={ Left:right-buttonSize-this.Mergin.Right, Top:rtLeft.Top, Width:buttonSize, Height:buttonSize };
        rtRight.Right=rtRight.Left+buttonSize;
        rtRight.Bottom=rtRight.Top+buttonSize;

        this.Canvas.fillStyle=this.ButtonColor;
        this.Canvas.fillRect(rtLeft.Left,rtLeft.Top,rtLeft.Width,rtLeft.Height);   
        this.Canvas.fillRect(rtRight.Left,rtRight.Top,rtRight.Width,rtRight.Height); 

        this.Canvas.strokeStyle=this.BorderColor;
        this.Canvas.strokeRect(rtLeft.Left,rtLeft.Top,rtLeft.Width,rtLeft.Height);
        this.Canvas.strokeRect(rtRight.Left,rtRight.Top,rtRight.Width,rtRight.Height);


        var centerWidth = (rtRight.Left - 2) - (rtLeft.Right + 2);
	    var value = centerWidth - this.ScrollBarWidth;
	    var xOffset = (value * this.CurrentPos) / this.MaxPos;
	    var x = rtLeft.Right + 2 + xOffset;

        var rtBar = {Left:x, Top:rtLeft.Top, Width:this.ScrollBarWidth, Height: rtLeft.Height };
        rtBar.Right=rtBar.Left+this.ScrollBarWidth;
        rtBar.Bottom=rtLeft.Bottom;

        this.Canvas.fillStyle=this.BarColor;
        this.Canvas.fillRect(rtBar.Left,rtBar.Top,rtBar.Width,rtBar.Height);

        this.RectScroll.Left=rtLeft;
        this.RectScroll.Right=rtRight;
        this.RectScroll.Bar=rtBar;
        this.RectScroll.Client={ Left:rtLeft.Right, Right: rtRight.Left, Top:rtLeft.Top, Bottom:rtLeft.Bottom };
    }

    this.DrawTab=function(left, top, right, bottom)
    {
        this.TabWidth=0;
        this.Canvas.font=this.TabFont;
        this.Canvas.textBaseline="bottom";

        var tabHeight=bottom-top;
        var itemLeft=left+1;
        var y=bottom-this.TabMergin.Bottom, x=0;
        var text;
        var itemWidth=0;
        var i=0;
        for(i=0;i<this.TabList.length;++i)
        {
            var item=this.TabList[i];
            text=item.Title;

            if (item.IsMenu) text+="▲";

            x=itemLeft+this.TabMergin.Left;
            itemWidth=this.Canvas.measureText(text).width;

            var rtItem={Left:itemLeft, Top:top, Width:itemWidth+this.TabMergin.Left+this.TabMergin.Right, Height:tabHeight};
            rtItem.Right=rtItem.Left+rtItem.Width;
            rtItem.Bottom=rtItem.Top+rtItem.Height;
            if (rtItem.Right>right) break;

            

            var bgColor=this.TabBGColor;
            if (i==this.SelectedTabIndex) bgColor=this.TabSelectedBGColor
            this.Canvas.fillStyle=bgColor;
            this.Canvas.fillRect(rtItem.Left,rtItem.Top,rtItem.Width,rtItem.Height);  

            this.Canvas.textAlign="left";
            var textColor=this.TabTitleColor;
            if (i==this.MoveOnTabIndex) textColor=this.TabMoveOnTitleColor;
            if (i==this.SelectedTabIndex) textColor=this.TabSelectedTitleColor;
            this.Canvas.fillStyle=textColor;
            this.Canvas.fillText(text,x,y);

            item.Rect=rtItem;
            itemLeft+=rtItem.Width+1;
            this.TabWidth+=rtItem.Width+1;
        }

        for(;i<this.TabList.length;++i)
        {
            var item=this.TabList[i];
            item.Rect=null;
        }
    }

    this.OnMouseDown=function(x,y, e)
    {
        var tab=this.PtInTab(x,y);
        if (tab) return tab;
        return this.PtInScroll(x,y);
    }

    // Type 1-4 滚动条
    this.PtInScroll=function(x,y)
    {
        if (!this.RectScroll) return null;

        if (this.RectScroll.Left)
        {
            var rtItem=this.RectScroll.Left;
            if (x>=rtItem.Left && x<=rtItem.Right && y>=rtItem.Top && y<=rtItem.Bottom) return { Type: 1, Rect: rtItem };
        }

        if (this.RectScroll.Right)
        {
            var rtItem=this.RectScroll.Right;
            if (x>=rtItem.Left && x<=rtItem.Right && y>=rtItem.Top && y<=rtItem.Bottom) return { Type: 2, Rect: rtItem };
        }

        if (this.RectScroll.Bar)
        {
            var rtItem=this.RectScroll.Bar;
            if (x>=rtItem.Left && x<=rtItem.Right && y>=rtItem.Top && y<=rtItem.Bottom) return { Type: 3, Rect: rtItem };
        }

        if (this.RectScroll.Client)
        {
            var rtItem=this.RectScroll.Client;
            if (x>=rtItem.Left && x<=rtItem.Right && y>=rtItem.Top && y<=rtItem.Bottom) 
            {
                return { Type: 4, Rect: rtItem , Pos: this.GetScrollPostionByPoint(x,y) };
            }
        }

        return null;
    }

    // Type=5 标签 6=标签菜单
    this.PtInTab=function(x,y)
    {
        for(var i=0;i<this.TabList.length;++i)
        {
            var item=this.TabList[i];
            if (!item.Rect) continue;
            var rtItem=item.Rect;
            if (x>=rtItem.Left && x<=rtItem.Right && y>=rtItem.Top && y<=rtItem.Bottom) 
            {
                var result= { Type: 5, Rect: rtItem, Tab:item, Index:i };
                if (item.IsMenu==true) result.Type==6;
                return result;
            }   
        }

        return null;
    }

    this.GetFontHeight=function(font,word)
    {
        return GetFontHeight(this.Canvas, font, word);
    }

    this.GetScrollPostionByPoint=function(x,y)
    {
        var rtItem=this.RectScroll.Client;
        var value=rtItem.Right-rtItem.Left-this.ScrollBarWidth;
        var pos =parseInt((this.MaxPos * (x - rtItem.Left)) / value);
        return pos;
    }
}


//页脚信息
function ChartReportPageInfo()
{
    this.Canvas;                        //画布
    this.ChartBorder;                   //边框信息
    this.ChartFrame;                    //框架画法
    this.Name;                          //名称
    this.ClassName='ChartPageInfo';     //类名
    this.IsDrawFirst=false;
    this.IsShow=false;                   //是否显示
    this.SizeChange=true;
    this.Report;

    this.FontConfig={ Size:g_JSChartResource.Report.PageInfo.Font.Size, Name:g_JSChartResource.Report.PageInfo.Font.Name };
    this.TextColor=g_JSChartResource.Report.PageInfo.TextColor;
    this.BGColor=g_JSChartResource.Report.PageInfo.BGColor;
    this.Mergin=
    {
        Top:g_JSChartResource.Report.PageInfo.Mergin.Top, 
        Left:g_JSChartResource.Report.PageInfo.Mergin.Left, 
        Right:g_JSChartResource.Report.PageInfo.Mergin.Right,
        Bottom:g_JSChartResource.Report.PageInfo.Mergin.Bottom
    }


    this.Font;
    this.TextHeight=0;

    this.ReloadResource=function(resource)
    {
        this.FontConfig={ Size:g_JSChartResource.Report.PageInfo.Font.Size, Name:g_JSChartResource.Report.PageInfo.Font.Name };
        this.TextColor=g_JSChartResource.Report.PageInfo.TextColor;
        this.BGColor=g_JSChartResource.Report.PageInfo.BGColor;
        this.Mergin=
        {
            Top:g_JSChartResource.Report.PageInfo.Mergin.Top, 
            Left:g_JSChartResource.Report.PageInfo.Mergin.Left, 
            Right:g_JSChartResource.Report.PageInfo.Mergin.Right,
            Bottom:g_JSChartResource.Report.PageInfo.Mergin.Bottom
        }
    }

    this.Draw=function()
    {
        if (!this.IsShow) return;
        if (!this.Report) return;

        var pageStatus=this.Report.GetCurrentPageStatus();
        if (pageStatus.IsSinglePage) return;

        if (this.SizeChange)
        {
            var pixelRatio=GetDevicePixelRatio();
            this.Font=`${this.FontConfig.Size*pixelRatio}px ${ this.FontConfig.Name}`;
            this.TextHeight=GetFontHeight(this.Canvas, this.Font, "擎")+this.Mergin.Top+this.Mergin.Bottom;
        }
        
        var left=this.ChartBorder.GetLeft();
        var right=this.ChartBorder.GetRight();
        var bottom=this.ChartBorder.GetBottom()-2;

        var center=left+(right-left)/2;
        var text=`${pageStatus.DataCount}/${pageStatus.DataCount}`;
        this.Canvas.font=this.Font;
        var textWidth=this.Canvas.measureText(text).width+4;

        var bgLeft=center-textWidth/2-this.Mergin.Left;
        var bgTop=bottom-this.TextHeight;
        this.Canvas.fillStyle=this.BGColor;;
        this.Canvas.fillRect(bgLeft,bgTop,textWidth+(this.Mergin.Left+this.Mergin.Right),this.TextHeight);   

        text=`${pageStatus.Start+1}/${pageStatus.DataCount}`;
        this.Canvas.textAlign="center";
        this.Canvas.textBaseline="bottom";
        this.Canvas.fillStyle=this.TextColor;
        this.Canvas.fillText(text,center,bottom-this.Mergin.Bottom);

        this.SizeChange=false;
    }
}
