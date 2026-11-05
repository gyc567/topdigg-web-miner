> 译文来源：HeyPuter/everything 仓库 <https://github.com/HeyPuter/everything> 中的 `README.md`（commit f45527dee1f82c816849e6a3854c09da591f50b8）。
> 以下为中文翻译，命令、代码、路径与链接保持原样。

<p align="center"><img src="assets/everything.png" width="300" alt="Everything"></p>

<h3 align="center">世界的软件，重建并开源。</h3>

<!-- App names, descriptions, and navigation are native text. The Everything logo, app icons, and decorative hero are images. Demo and source links use project metadata where available; missing destinations point to the link-status note. -->

<p align="center"><img src="assets/hero/variants/34-app-wall-intact.png" width="100%" alt="Everything: a wall of app screenshots extending beyond the frame"></p>

Everything 项目（The Everything Project）旨在从零开始重建并开源世界的软件。从 Office 到 Slack，从 Photoshop 到 AutoCAD，我们正在为所有专有软件打造免费、开源的替代品。这是一个 mono-repository（单仓库），包含该项目下开发的所有应用与工具。


[办公](#office) · [协作](#collaboration) · [创意工具](#creative-tools) · [工程](#engineering) · [效率](#productivity) · [财务](#finance) · [商业](#business) · [开发者工具](#developer-tools) · [游戏](#games)

<br>

## 快速开始

需要 Node.js 22.12 或更高版本。

```sh
git clone https://github.com/HeyPuter/everything.git
cd everything/src/[app-name]
npm install
npm run dev
```

<br>

## 办公

<table width="100%">
<tr><th width="296" align="left">应用</th><th width="420" align="left">可替代</th><th width="150" align="left">链接</th></tr>
<tr><td width="296" valign="middle" nowrap><a href="https://spreadsheet.puter.com/"><img src="src/spreadsheet/icon-128.png" width="48" height="48" alt="" align="center"></a> &nbsp; <strong><a href="https://spreadsheet.puter.com/">Spreadsheet（电子表格）</a></strong></td><td width="420" valign="middle">Microsoft Excel、Google Sheets、Apple Numbers</td><td width="150" valign="middle" nowrap><a href="https://spreadsheet.puter.com/">在线试用</a>&nbsp;|&nbsp;<a href="src/spreadsheet/">源码</a></td></tr>
<tr><td width="296" valign="middle" nowrap><a href="https://documents.puter.com"><img src="src/documents/icon-128.png" width="48" height="48" alt="" align="center"></a> &nbsp; <strong><a href="https://documents.puter.com/">Documents（文档）</a></strong></td><td width="420" valign="middle">Microsoft Word、Google Docs、Apple Pages</td><td width="150" valign="middle" nowrap><a href="https://documents.puter.com">在线试用</a>&nbsp;|&nbsp;<a href="src/documents/">源码</a></td></tr>
<tr><td width="296" valign="middle" nowrap><a href="https://presentation.puter.com/"><img src="src/presentation/icon-128.png" width="48" height="48" alt="" align="center"></a> &nbsp; <strong><a href="https://presentation.puter.com/">Presentation（演示文稿）</a></strong></td><td width="420" valign="middle">Microsoft PowerPoint、Google Slides、Apple Keynote</td><td width="150" valign="middle" nowrap><a href="https://presentation.puter.com/">在线试用</a>&nbsp;|&nbsp;<a href="src/presentation/">源码</a></td></tr>
<tr><td width="296" valign="middle" nowrap><a href="https://whiteboard.puter.com/"><img src="src/whiteboard/icon-128.png" width="48" height="48" alt="" align="center"></a> &nbsp; <strong><a href="https://whiteboard.puter.com/">Whiteboard（白板）</a></strong></td><td width="420" valign="middle">Miro、Microsoft Whiteboard、FigJam</td><td width="150" valign="middle" nowrap><a href="https://whiteboard.puter.com/">在线试用</a>&nbsp;|&nbsp;<a href="src/whiteboard/">源码</a></td></tr>
<tr><td width="296" valign="middle" nowrap><a href="https://pdf.puter.com/"><img src="src/pdf/icon-128.png" width="48" height="48" alt="" align="center"></a> &nbsp; <strong><a href="https://pdf.puter.com/">PDF</a></strong></td><td width="420" valign="middle">Adobe Acrobat、PDF Expert</td><td width="150" valign="middle" nowrap><a href="https://pdf.puter.com/">在线试用</a>&nbsp;|&nbsp;<a href="src/pdf/">源码</a></td></tr>
<tr><td width="296" valign="middle" nowrap><a href="https://notes.puter.com"><img src="src/notes/icon-128.png" width="48" height="48" alt="" align="center"></a> &nbsp; <strong><a href="https://notes.puter.com">Notes（笔记）</a></strong></td><td width="420" valign="middle">Microsoft OneNote、Evernote、Apple Notes</td><td width="150" valign="middle" nowrap><a href="#link-status" title="Demo URL not yet provided">在线试用</a>&nbsp;|&nbsp;<a href="src/notes/">源码</a></td></tr>
<tr><td width="296" valign="middle" nowrap><a href="https://records.puter.com/"><img src="src/records/icon-128.png" width="48" height="48" alt="" align="center"></a> &nbsp; <strong><a href="https://records.puter.com/">Records（记录）</a></strong></td><td width="420" valign="middle">Airtable、Microsoft Access、Baserow</td><td width="150" valign="middle" nowrap><a href="https://records.puter.com/">在线试用</a>&nbsp;|&nbsp;<a href="src/records/">源码</a></td></tr>
</table>

<br>

## 协作

<table width="100%">
<tr><th width="296" align="left">应用</th><th width="420" align="left">可替代</th><th width="150" align="left">链接</th></tr>
<tr><td width="296" valign="middle" nowrap><a href="https://meetings.puter.com/"><img src="src/meetings/icon-128.png" width="48" height="48" alt="" align="center"></a> &nbsp; <strong><a href="https://meetings.puter.com/">Meetings（会议）</a></strong></td><td width="420" valign="middle">Zoom、Google Meet、Microsoft Teams</td><td width="150" valign="middle" nowrap><a href="https://meetings.puter.com/">在线试用</a>&nbsp;|&nbsp;<a href="src/meetings/">源码</a></td></tr>
<tr><td width="296" valign="middle" nowrap><a href="https://teamchat.puter.com/"><img src="src/teamchat/icon-128.png" width="48" height="48" alt="" align="center"></a> &nbsp; <strong><a href="https://teamchat.puter.com/">Teamchat（团队聊天）</a></strong></td><td width="420" valign="middle">Slack、Microsoft Teams、Google Chat</td><td width="150" valign="middle" nowrap><a href="https://teamchat.puter.com/">在线试用</a>&nbsp;|&nbsp;<a href="src/teamchat/">源码</a></td></tr>
<tr><td width="296" valign="middle" nowrap><a href="https://email.puter.com/"><img src="src/email/icon-128.png" width="48" height="48" alt="" align="center"></a> &nbsp; <strong><a href="https://email.puter.com/">Email（电子邮件）</a></strong></td><td width="420" valign="middle">Gmail、Microsoft Outlook、Apple Mail</td><td width="150" valign="middle" nowrap><a href="https://email.puter.com/" title="Demo URL not yet provided">在线试用</a>&nbsp;|&nbsp;<a href="src/email/">源码</a></td></tr>
<tr><td width="296" valign="middle" nowrap><a href="https://contacts.puter.com/"><img src="src/contacts/icon-128.png" width="48" height="48" alt="" align="center"></a> &nbsp; <strong><a href="https://contacts.puter.com/">Contacts（联系人）</a></strong></td><td width="420" valign="middle">Google Contacts、Apple Contacts</td><td width="150" valign="middle" nowrap><a href="https://contacts.puter.com/">在线试用</a>&nbsp;|&nbsp;<a href="src/contacts/">源码</a></td></tr>
<tr><td width="296" valign="middle" nowrap><a href="https://calendar.puter.com/"><img src="src/calendar/icon-128.png" width="48" height="48" alt="" align="center"></a> &nbsp; <strong><a href="https://calendar.puter.com/">Calendar（日历）</a></strong></td><td width="420" valign="middle">Google Calendar、Apple Calendar、Outlook Calendar</td><td width="150" valign="middle" nowrap><a href="https://calendar.puter.com/">在线试用</a>&nbsp;|&nbsp;<a href="src/calendar/">源码</a></td></tr>
<tr><td width="296" valign="middle" nowrap><a href="https://sign.puter.com"><img src="src/signatures/icon-128.png" width="48" height="48" alt="" align="center"></a> &nbsp; <strong><a href="https://sign.puter.com">Signatures（电子签名）</a></strong></td><td width="420" valign="middle">DocuSign、Adobe Acrobat Sign、Dropbox Sign</td><td width="150" valign="middle" nowrap><a href="https://sign.puter.com" title="Demo URL not yet provided">在线试用</a>&nbsp;|&nbsp;<a href="src/signatures/">源码</a></td></tr>
</table>

<br>

## 创意工具

<table width="100%">
<tr><th width="296" align="left">应用</th><th width="420" align="left">可替代</th><th width="150" align="left">链接</th></tr>
<tr><td width="296" valign="middle" nowrap><a href="https://ps.puter.com"><img src="src/photo-studio/icon-128.png" width="48" height="48" alt="" align="center"></a> &nbsp; <strong><a href="https://ps.puter.com">Photo Studio（照片工作室）</a></strong></td><td width="420" valign="middle">Adobe Photoshop、Pixelmator</td><td width="150" valign="middle" nowrap><a href="https://ps.puter.com" title="Demo URL not yet provided">在线试用</a>&nbsp;|&nbsp;<a href="src/photo-studio/">源码</a></td></tr>
<tr><td width="296" valign="middle" nowrap><a href="https://vs.puter.com"><img src="src/video-studio/icon-128.png" width="48" height="48" alt="" align="center"></a> &nbsp; <strong><a href="https://vs.puter.com">Video Studio（视频工作室）</a></strong></td><td width="420" valign="middle">CapCut、Adobe Premiere Pro、Final Cut Pro、DaVinci Resolve</td><td width="150" valign="middle" nowrap><a href="https://vs.puter.com" title="Demo URL not yet provided">在线试用</a>&nbsp;|&nbsp;<a href="src/video-studio/">源码</a></td></tr>
<tr><td width="296" valign="middle" nowrap><a href="https://ves.puter.com"><img src="src/vector-studio/icon-128.png" width="48" height="48" alt="" align="center"></a> &nbsp; <strong><a href="https://ves.puter.com">Vector Studio（矢量工作室）</a></strong></td><td width="420" valign="middle">Adobe Illustrator、CorelDRAW、Affinity Designer</td><td width="150" valign="middle" nowrap><a href="https://ves.puter.com" title="Demo URL not yet provided">在线试用</a>&nbsp;|&nbsp;<a href="src/vector-studio/">源码</a></td></tr>
<tr><td width="296" valign="middle" nowrap><a href="https://as.puter.com/"><img src="src/audio-studio/icon-128.png" width="48" height="48" alt="" align="center"></a> &nbsp; <strong><a href="https://as.puter.com/">Audio Studio（音频工作室）</a></strong></td><td width="420" valign="middle">Adobe Audition、Sound Forge</td><td width="150" valign="middle" nowrap><a href="https://as.puter.com/">在线试用</a>&nbsp;|&nbsp;<a href="src/audio-studio/">源码</a></td></tr>
<tr><td width="296" valign="middle" nowrap><a href="https://ms.puter.com/"><img src="src/music-studio/icon-128.png" width="48" height="48" alt="" align="center"></a> &nbsp; <strong><a href="https://ms.puter.com/">Music Studio（音乐工作室）</a></strong></td><td width="420" valign="middle">FL Studio、Ableton Live、Logic Pro</td><td width="150" valign="middle" nowrap><a href="https://ms.puter.com/">在线试用</a>&nbsp;|&nbsp;<a href="src/music-studio/">源码</a></td></tr>
<tr><td width="296" valign="middle" nowrap><a href="https://3d.puter.com"><img src="src/3d/icon-128.png" width="48" height="48" alt="" align="center"></a> &nbsp; <strong><a href="https://3d.puter.com">3D Studio（三维工作室）</a></strong></td><td width="420" valign="middle">Autodesk Maya、SketchUp</td><td width="150" valign="middle" nowrap><a href="https://3d.puter.com" title="Demo URL not yet provided">在线试用</a>&nbsp;|&nbsp;<a href="src/3d/">源码</a></td></tr>
</table>

<br>

## 工程

<table width="100%">
<tr><th width="296" align="left">应用</th><th width="420" align="left">可替代</th><th width="150" align="left">链接</th></tr>
<tr><td width="296" valign="middle" nowrap><a href="https://cad.puter.com/"><img src="src/cad/icon-128.png" width="48" height="48" alt="" align="center"></a> &nbsp; <strong><a href="https://cad.puter.com/">CAD</a></strong></td><td width="420" valign="middle">AutoCAD、DraftSight、BricsCAD</td><td width="150" valign="middle" nowrap><a href="https://cad.puter.com/">在线试用</a>&nbsp;|&nbsp;<a href="src/cad/">源码</a></td></tr>
<tr><td width="296" valign="middle" nowrap><a href="https://parametric.puter.com/"><img src="src/parametric/icon-128.png" width="48" height="48" alt="" align="center"></a> &nbsp; <strong><a href="https://parametric.puter.com/">Parametric（参数化建模）</a></strong></td><td width="420" valign="middle">SolidWorks、Autodesk Fusion、Autodesk Inventor</td><td width="150" valign="middle" nowrap><a href="https://parametric.puter.com/">在线试用</a>&nbsp;|&nbsp;<a href="src/parametric/">源码</a></td></tr>
<tr><td width="296" valign="middle" nowrap><a href="https://circuits.puter.com/"><img src="src/circuits/icon-128.png" width="48" height="48" alt="" align="center"></a> &nbsp; <strong><a href="https://circuits.puter.com/">Circuits（电路）</a></strong></td><td width="420" valign="middle">Altium Designer、Autodesk Eagle、OrCAD</td><td width="150" valign="middle" nowrap><a href="https://circuits.puter.com/">在线试用</a>&nbsp;|&nbsp;<a href="src/circuits/">源码</a></td></tr>
<tr><td width="296" valign="middle" nowrap><a href="https://bd.puter.com/"><img src="src/building-design/icon-128.png" width="48" height="48" alt="" align="center"></a> &nbsp; <strong><a href="https://bd.puter.com/">Building Design（建筑设计）</a></strong></td><td width="420" valign="middle">Autodesk Revit、ArchiCAD、Vectorworks</td><td width="150" valign="middle" nowrap><a href="https://bd.puter.com/">在线试用</a>&nbsp;|&nbsp;<a href="src/building-design/">源码</a></td></tr>
</table>

<br>

## 效率

<table width="100%">
<tr><th width="296" align="left">应用</th><th width="420" align="left">可替代</th><th width="150" align="left">链接</th></tr>
<tr><td width="296" valign="middle" nowrap><a href="https://tasks.puter.com"><img src="./src/tasks/icon-128.png" width="48" height="48" alt="" align="center"></a> &nbsp; <strong><a href="https://tasks.puter.com">Tasks（任务）</a></strong></td><td width="420" valign="middle">Todoist、Microsoft To Do、TickTick</td><td width="150" valign="middle" nowrap><a href="https://tasks.puter.com" title="Demo URL not yet provided">在线试用</a>&nbsp;|&nbsp;<a href="src/tasks/">源码</a></td></tr>
<tr><td width="296" valign="middle" nowrap><a href="https://projects.puter.com"><img src="src/projects/icon-128.png" width="48" height="48" alt="" align="center"></a> &nbsp; <strong><a href="https://projects.puter.com">Projects（项目）</a></strong></td><td width="420" valign="middle">Trello、Asana、monday.com</td><td width="150" valign="middle" nowrap><a href="https://projects.puter.com" title="Demo URL not yet provided">在线试用</a>&nbsp;|&nbsp;<a href="src/projects/">源码</a></td></tr>
<tr><td width="296" valign="middle" nowrap><a href="https://wiki.puter.com/"><img src="src/wiki/icon-128.png" width="48" height="48" alt="" align="center"></a> &nbsp; <strong><a href="https://wiki.puter.com/">Wiki（知识库）</a></strong></td><td width="420" valign="middle">Notion、Confluence、Coda</td><td width="150" valign="middle" nowrap><a href="#link-status" title="Demo URL not yet provided">在线试用</a>&nbsp;|&nbsp;<a href="src/wiki/">源码</a></td></tr>
<tr><td width="296" valign="middle" nowrap><a href="https://tt.puter.com"><img src="./src/time-tracking/icon-128.png" width="48" height="48" alt="" align="center"></a> &nbsp; <strong><a href="https://tt.puter.com">Time Tracking（工时跟踪）</a></strong></td><td width="420" valign="middle">Toggl Track、Harvest、Clockify</td><td width="150" valign="middle" nowrap><a href="https://tt.puter.com" title="Demo URL not yet provided">在线试用</a>&nbsp;|&nbsp;<a href="src/time-tracking/">源码</a></td></tr>
<tr><td width="296" valign="middle" nowrap><a href="https://survey.puter.com/"><img src="src/survey/icon-128.png" width="48" height="48" alt="" align="center"></a> &nbsp; <strong><a href="https://survey.puter.com/">Surveys（问卷）</a></strong></td><td width="420" valign="middle">SurveyMonkey、Google Forms、Typeform</td><td width="150" valign="middle" nowrap><a href="https://survey.puter.com/" title="Demo URL not yet provided">在线试用</a>&nbsp;|&nbsp;<a href="src/survey/">源码</a></td></tr>
</table>

<br>

## 财务

<table width="100%">
<tr><th width="296" align="left">应用</th><th width="420" align="left">可替代</th><th width="150" align="left">链接</th></tr>
<tr><td width="296" valign="middle" nowrap><a href="https://accounting.puter.com/"><img src="src/accounting/icon-128.png" width="48" height="48" alt="" align="center"></a> &nbsp; <strong><a href="https://accounting.puter.com/">Accounting（会计）</a></strong></td><td width="420" valign="middle">QuickBooks Online、Xero、Wave Accounting</td><td width="150" valign="middle" nowrap><a href="https://accounting.puter.com/" title="Demo URL not yet provided">在线试用</a>&nbsp;|&nbsp;<a href="src/accounting/">源码</a></td></tr>
<tr><td width="296" valign="middle" nowrap><a href="https://invoicing.puter.com/"><img src="src/invoicing/icon-128.png" width="48" height="48" alt="" align="center"></a> &nbsp; <strong><a href="https://invoicing.puter.com/">Invoicing（开票）</a></strong></td><td width="420" valign="middle">FreshBooks、Zoho Invoice、Wave Invoicing</td><td width="150" valign="middle" nowrap><a href="https://invoicing.puter.com/" title="Demo URL not yet provided">在线试用</a>&nbsp;|&nbsp;<a href="src/invoicing/">源码</a></td></tr>
<tr><td width="296" valign="middle" nowrap><a href="https://expenses.puter.com/"><img src="src/expense/icon-128.png" width="48" height="48" alt="" align="center"></a> &nbsp; <strong><a href="https://expenses.puter.com/">Expenses（报销）</a></strong></td><td width="420" valign="middle">Expensify、SAP Concur、Zoho Expense</td><td width="150" valign="middle" nowrap><a href="#link-status" title="Demo URL not yet provided">在线试用</a>&nbsp;|&nbsp;<a href="src/expense/">源码</a></td></tr>
<tr><td width="296" valign="middle" nowrap><a href="https://captable.puter.com/"><img src="src/cap-table/icon-128.png" width="48" height="48" alt="" align="center"></a> &nbsp; <strong><a href="https://captable.puter.com">Cap Table（股权结构表）</a></strong></td><td width="420" valign="middle">Carta、Pulley</td><td width="150" valign="middle" nowrap><a href="https://captable.puter.com/">在线试用</a>&nbsp;|&nbsp;<a href="src/cap-table/">源码</a></td></tr>
</table>

<br>

## 商业

<table width="100%">
<tr><th width="296" align="left">应用</th><th width="420" align="left">可替代</th><th width="150" align="left">链接</th></tr>
<tr><td width="296" valign="middle" nowrap><a href="https://crm.puter.com/"><img src="src/crm/icon-128.png" width="48" height="48" alt="" align="center"></a> &nbsp; <strong><a href="https://crm.puter.com/">CRM（客户关系管理）</a></strong></td><td width="420" valign="middle">Salesforce、HubSpot CRM、Pipedrive</td><td width="150" valign="middle" nowrap><a href="https://crm.puter.com/" title="Demo URL not yet provided">在线试用</a>&nbsp;|&nbsp;<a href="src/crm/">源码</a></td></tr>
<tr><td width="296" valign="middle" nowrap><a href="https://help.puter.com/"><img src="src/help-desk/icon-128.png" width="48" height="48" alt="" align="center"></a> &nbsp; <strong><a href="https://help.puter.com/">Help Desk（服务台）</a></strong></td><td width="420" valign="middle">Zendesk、Freshdesk、Intercom、Help Scout</td><td width="150" valign="middle" nowrap><a href="https://help.puter.com/" title="Demo URL not yet provided">在线试用</a>&nbsp;|&nbsp;<a href="src/help-desk/">源码</a></td></tr>
<tr><td width="296" valign="middle" nowrap><a href="https://contracts.puter.com/"><img src="src/contracts/icon-128.png" width="48" height="48" alt="" align="center"></a> &nbsp; <strong><a href="https://contracts.puter.com/">Contracts（合同）</a></strong></td><td width="420" valign="middle">ContractSafe、Juro</td><td width="150" valign="middle" nowrap><a href="https://contracts.puter.com/" title="Demo URL not yet provided">在线试用</a>&nbsp;|&nbsp;<a href="src/contracts/">源码</a></td></tr>
<tr><td width="296" valign="middle" nowrap><a href="https://pos.puter.com/"><img src="src/pos/icon-128.png" width="48" height="48" alt="" align="center"></a> &nbsp; <strong><a href="https://pos.puter.com/">Point of Sale（销售点）</a></strong></td><td width="420" valign="middle">Square POS、Shopify POS、Lightspeed</td><td width="150" valign="middle" nowrap><a href="https://pos.puter.com/" title="Demo URL not yet provided">在线试用</a>&nbsp;|&nbsp;<a href="src/pos/">源码</a></td></tr>
<tr><td width="296" valign="middle" nowrap><a href="https://inventory.puter.com/"><img src="src/inventory/icon-128.png" width="48" height="48" alt="" align="center"></a> &nbsp; <strong><a href="https://inventory.puter.com/">Inventory（库存）</a></strong></td><td width="420" valign="middle">Zoho Inventory、Sortly、inFlow Inventory</td><td width="150" valign="middle" nowrap><a href="https://inventory.puter.com/">在线试用</a>&nbsp;|&nbsp;<a href="src/inventory/">源码</a></td></tr>
<tr><td width="296" valign="middle" nowrap><img src="src/assets/icon-128.png" width="48" height="48" alt="" align="center"> &nbsp; <strong><a href="../equipment/">Assets（资产）</a></strong></td><td width="420" valign="middle">Asset Panda、EZOfficeInventory</td><td width="150" valign="middle" nowrap><a href="#link-status" title="Demo URL not yet provided">在线试用</a>&nbsp;|&nbsp;<a href="src/assets/">源码</a></td></tr>
<tr><td width="296" valign="middle" nowrap><a href="https://hiring.puter.com/"><img src="src/hiring/icon-128.png" width="48" height="48" alt="" align="center"></a> &nbsp; <strong><a href="https://hiring.puter.com/">Hiring（招聘）</a></strong></td><td width="420" valign="middle">Greenhouse、Lever、Workable</td><td width="150" valign="middle" nowrap><a href="https://hiring.puter.com/" title="Demo URL not yet provided">在线试用</a>&nbsp;|&nbsp;<a href="src/hiring/">源码</a></td></tr>
<tr><td width="296" valign="middle" nowrap><a href="https://shifts.puter.com/"><img src="src/shifts/icon-128.png" width="48" height="48" alt="" align="center"></a> &nbsp; <strong><a href="https://shifts.puter.com/">Shifts（排班）</a></strong></td><td width="420" valign="middle">Deputy、When I Work、Homebase</td><td width="150" valign="middle" nowrap><a href="https://shifts.puter.com/" title="Demo URL not yet provided">在线试用</a>&nbsp;|&nbsp;<a href="src/shifts/">源码</a></td></tr>
<tr><td width="296" valign="middle" nowrap><a href="https://childcare.puter.com/"><img src="src/childcare/icon-128.png" width="48" height="48" alt="" align="center"></a> &nbsp; <strong><a href="https://childcare.puter.com/">Childcare（托育）</a></strong></td><td width="420" valign="middle">brightwheel、Procare、HiMama</td><td width="150" valign="middle" nowrap><a href="https://childcare.puter.com/" title="Demo URL not yet provided">在线试用</a>&nbsp;|&nbsp;<a href="src/childcare/">源码</a></td></tr>
<tr><td width="296" valign="middle" nowrap><a href="https://fieldservice.puter.com/"><img src="src/field-service/icon-128.png" width="48" height="48" alt="" align="center"></a> &nbsp; <strong><a href="https://fieldservice.puter.com/">Field Service（现场服务）</a></strong></td><td width="420" valign="middle">Jobber、Housecall Pro、ServiceTitan</td><td width="150" valign="middle" nowrap><a href="https://fieldservice.puter.com/" title="Demo URL not yet provided">在线试用</a>&nbsp;|&nbsp;<a href="src/field-service/">源码</a></td></tr>
<tr><td width="296" valign="middle" nowrap><a href="https://legal.puter.com/"><img src="src/legal/icon-128.png" width="48" height="48" alt="" align="center"></a> &nbsp; <strong><a href="https://legal.puter.com/">Legal（法律事务）</a></strong></td><td width="420" valign="middle">Clio、MyCase、PracticePanther</td><td width="150" valign="middle" nowrap><a href="https://legal.puter.com/" title="Demo URL not yet provided">在线试用</a>&nbsp;|&nbsp;<a href="src/legal/">源码</a></td></tr>
<tr><td width="296" valign="middle" nowrap><a href="https://fleet.puter.com/"><img src="src/fleet/icon-128.png" width="48" height="48" alt="" align="center"></a> &nbsp; <strong><a href="https://fleet.puter.com/">Fleet（车队）</a></strong></td><td width="420" valign="middle">Fleetio、Samsara Fleet Maintenance、Whip Around</td><td width="150" valign="middle" nowrap><a href="https://fleet.puter.com/" title="Demo URL not yet provided">在线试用</a>&nbsp;|&nbsp;<a href="src/fleet/">源码</a></td></tr>
<tr><td width="296" valign="middle" nowrap><img src="src/property-management/icon-128.png" width="48" height="48" alt="" align="center"> &nbsp; <strong><a href="src/property-management/">Property Management（物业管理）</a></strong></td><td width="420" valign="middle">Buildium、AppFolio、Rent Manager</td><td width="150" valign="middle" nowrap><a href="#link-status" title="Demo URL not yet provided">在线试用</a>&nbsp;|&nbsp;<a href="src/property-management/">源码</a></td></tr>
</table>

<br>

## 开发者工具

<table width="100%">
<tr><th width="296" align="left">应用</th><th width="420" align="left">可替代</th><th width="150" align="left">链接</th></tr>
<tr><td width="296" valign="middle" nowrap><img src="src/api-client/icon-128.png" width="48" height="48" alt="" align="center"> &nbsp; <strong><a href="https://apic.puter.com/">API Client（API 客户端）</a></strong></td><td width="420" valign="middle">Postman、Insomnia、Hoppscotch</td><td width="150" valign="middle" nowrap><a href="#link-status" title="Demo URL not yet provided">在线试用</a>&nbsp;|&nbsp;<a href="src/api-client/">源码</a></td></tr>
</table>

<br>

## 游戏

<table width="100%">
<tr><th width="296" align="left">应用</th><th width="420" align="left">说明</th><th width="150" align="left">链接</th></tr>
<tr><td width="296" valign="middle" nowrap><a href="https://chess.puter.com/"><img src="src/chess/icon-128.png" width="48" height="48" alt="" align="center"></a> &nbsp; <strong><a href="https://chess.puter.com/">Chess（国际象棋）</a></strong></td><td width="420" valign="middle">与电脑或好友对弈，带计时钟并支持在线对局。</td><td width="150" valign="middle" nowrap><a href="https://chess.puter.com/">在线试用</a>&nbsp;|&nbsp;<a href="src/chess/">源码</a></td></tr>
<tr><td width="296" valign="middle" nowrap><a href="https://backgammon.puter.com/"><img src="src/backgammon/icon-128.png" width="48" height="48" alt="" align="center"></a> &nbsp; <strong><a href="src/backgammon/">Backgammon（双陆棋）</a></strong></td><td width="420" valign="middle">与电脑或好友对弈，可本地也可在线。</td><td width="150" valign="middle" nowrap><a href="https://backgammon.puter.com/">在线试用</a>&nbsp;|&nbsp;<a href="src/backgammon/">源码</a></td></tr>
<tr><td width="296" valign="middle" nowrap><a href="https://checkers.puter.com/"><img src="src/checkers/icon-128.png" width="48" height="48" alt="" align="center"></a> &nbsp; <strong><a href="https://checkers.puter.com/">Checkers（跳棋）</a></strong></td><td width="420" valign="middle">美式跳棋，与电脑或好友对弈。</td><td width="150" valign="middle" nowrap><a href="https://checkers.puter.com/">在线试用</a>&nbsp;|&nbsp;<a href="src/checkers/">源码</a></td></tr>
<tr><td width="296" valign="middle" nowrap><a href="https://solitaire.puter.com/"><img src="src/solitaire/icon-128.png" width="48" height="48" alt="" align="center"></a> &nbsp; <strong><a href="https://solitaire.puter.com/">Solitaire（纸牌接龙）</a></strong></td><td width="420" valign="middle">Klondike（可翻一张或三张，可选拉斯维加斯计分）与 Spider 接龙，可选云端存档。</td><td width="150" valign="middle" nowrap><a href="https://solitaire.puter.com/">在线试用</a>&nbsp;|&nbsp;<a href="src/solitaire/">源码</a></td></tr>
<tr><td width="296" valign="middle" nowrap><a href="https://sudoku.puter.com/"><img src="src/sudoku/icon-128.png" width="48" height="48" alt="" align="center"></a> &nbsp; <strong><a href="https://sudoku.puter.com/">Sudoku（数独）</a></strong></td><td width="420" valign="middle">四个难度等级、每日谜题，以及会解释推理过程的提示。</td><td width="150" valign="middle" nowrap><a href="https://sudoku.puter.com/">在线试用</a>&nbsp;|&nbsp;<a href="src/sudoku/">源码</a></td></tr>
</table>

<br>

## 许可证

本仓库及其全部内容、子项目、模块与组件，除另有明确说明外，均采用 [MIT](LICENSE) 许可。仓库中包含的第三方库可能受其各自许可证约束。

## 译者注

- 应用名（如 Spreadsheet、Teamchat、3D Studio）保留英文原名并补充中文说明，便于与仓库中 `src/<app-name>/` 目录及 demo 域名对照；「可替代」一列中的产品名（Microsoft Excel、Adobe Photoshop 等）一律保留原名，不做翻译。
- 源文中「Try it」「Source」两个链接文本已译为「在线试用」「源码」，但链接目标与 `<table>` 的 HTML 结构、宽度属性均未改动，以保证渲染效果与原文一致。
- 源文多处 demo 链接带有 `title="Demo URL not yet provided"`（演示地址尚未提供）或指向 `#link-status`，本译文如实保留这些原始属性，未作美化或补充说明。
- 本文件是整个 Everything 项目的总入口 README：它把该项目定位为重建并开源世界软件的 mono-repository（单仓库），并按办公、协作、创意、工程、效率、财务、商业、开发者工具、游戏九大类罗列各应用及其可替代的商业产品。
