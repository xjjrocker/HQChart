import $ from 'jquery'

//把给外界调用的方法暴露出来
export default {
    jsChartInit: JSChart.Init,
    jsChartStyle:JSChart.SetStyle,
    // IsIndexSymbol:IsIndexSymbol,
    // BaseIndex:BaseIndex,
    // ChartLine:ChartLine,
    // ChartKLine:ChartKLine,
    // ChartMACD:ChartMACD,
    // DynamicTitleData:DynamicTitleData,
    // ChartVolStick:ChartVolStick,
    // SingleData:SingleData,
    // ChartData:ChartData

    //类导出
    JSChart:JSChart,        //行情图形库
    ChartData:ChartData,    //数据类
    HistoryData:HistoryData,    //K线数据结构
    MARKET_SUFFIX_NAME:MARKET_SUFFIX_NAME,  // 判断股票属性
    IFrameSplitOperator:IFrameSplitOperator,//格式化字符串方法
    FrameSplitKLinePriceY:FrameSplitKLinePriceY,
    FrameSplitKLineX:FrameSplitKLineX,
    JSKLineInfoMap:JSKLineInfoMap,
    JSCHART_EVENT_ID:JSCHART_EVENT_ID,      //可以订阅的事件类型
    JSCHART_OPERATOR_ID:JSCHART_OPERATOR_ID,    //图形控制类型
    JSCHART_DATA_FIELD_ID:JSCHART_DATA_FIELD_ID,//图形字段
    JSAlgorithm:JSAlgorithm,                //算法类
    JSComplier:JSComplier,                  //指标编译器
    JSIndexScript:JSIndexScript,            //系统指标库
    GetDevicePixelRatio,GetDevicePixelRatio,
    
    ScriptIndexConsole:ScriptIndexConsole,  //指标执行 无UI
    //style.js相关
    STYLE_TYPE_ID:STYLE_TYPE_ID,
    HQChartStyle:HQChartStyle,              //预定义全局的配色 黑

    JSConsole:JSConsole,    //日志输出

    KLineTooltipPaint:KLineTooltipPaint,    //K线tooltip
    MinuteTooltipPaint:MinuteTooltipPaint,  //走势图tooltip

    ChartDrawTwoPointDemo:ChartDrawTwoPointDemo,        //画图工具2个点例子
    ChartDrawThreePointDemo:ChartDrawThreePointDemo,    //画图工具3个点例子

    CoordinateInfo:CoordinateInfo,

    //成交明细
    JSDealChart:JSDealChart,
    DEAL_COLUMN_ID:DEAL_COLUMN_ID,

    //报价列表
    JSReportChart:JSReportChart,
    REPORT_COLUMN_ID:REPORT_COLUMN_ID,

    //图形基类导出
    IChartPainting:IChartPainting,              //图形
    IExtendChartPainting:IExtendChartPainting,  //扩展图形
    IChartTitlePainting:IChartTitlePainting,    //标题类
    IChartDrawPicture:IChartDrawPicture,        //画图工具
    DynamicTitleData:DynamicTitleData,          //指标标题数据
}