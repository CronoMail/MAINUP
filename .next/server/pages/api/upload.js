"use strict";(()=>{var e={};e.id=39,e.ids=[39],e.modules={145:e=>{e.exports=require("next/dist/compiled/next-server/pages-api.runtime.prod.js")},6089:e=>{e.exports=import("@octokit/rest")},6705:e=>{e.exports=import("formidable")},3292:e=>{e.exports=require("fs/promises")},3745:(e,t,a)=>{a.a(e,async(e,s)=>{try{a.r(t),a.d(t,{config:()=>p,default:()=>d,routeModule:()=>c});var r=a(1802),o=a(7153),i=a(6249),l=a(3178),n=e([l]);l=(n.then?(await n)():n)[0];let d=(0,i.l)(l,"default"),p=(0,i.l)(l,"config"),c=new r.PagesAPIRouteModule({definition:{kind:o.x.PAGES_API,page:"/api/upload",pathname:"/api/upload",bundlePath:"",filename:""},userland:l});s()}catch(e){s(e)}})},3178:(e,t,a)=>{a.a(e,async(e,s)=>{try{a.r(t),a.d(t,{config:()=>d,default:()=>handler});var r=a(6705),o=a(6089),i=a(3292),l=a.n(i),n=e([r,o]);[r,o]=n.then?(await n)():n;let d={api:{bodyParser:!1}};async function handler(e,t){if("POST"!==e.method)return t.status(405).json({message:"Method not allowed"});if(!process.env.GITHUB_PAT)return console.error("GitHub PAT not configured"),t.status(500).json({message:"GitHub authentication not configured"});let a=new o.Octokit({auth:process.env.GITHUB_PAT});try{let s=(0,r.default)();s.parse(e,async(e,s,r)=>{if(e)return t.status(500).json({message:"Error parsing form data"});if(!s.password||s.password[0]!==process.env.UPLOAD_PASSWORD)return t.status(401).json({message:"Unauthorized"});let o=Array.isArray(r.file)?r.file[0]:r.file;if(!o||!o.filepath)return t.status(400).json({message:"No valid file uploaded"});try{let e;let r=await l().readFile(o.filepath),i=o.originalFilename||"image.jpg";s.twitterId?.[0]&&s.twitterHandle?.[0]?(s.twitterHandle[0],s.twitterId[0]):s.twitterLink?.[0]&&s.twitterLink[0];try{let{data:t}=await a.repos.getContent({owner:process.env.GITHUB_OWNER||"",repo:process.env.GITHUB_REPO||"",path:`assets/Artworks NEW/${i}`});e=t.sha}catch(e){}await a.repos.createOrUpdateFileContents({owner:process.env.GITHUB_OWNER||"",repo:process.env.GITHUB_REPO||"",path:`assets/Artworks NEW/${i}`,message:"[skip deploy] Upload new artwork",content:r.toString("base64"),sha:e});let{data:n}=await a.repos.getContent({owner:process.env.GITHUB_OWNER||"",repo:process.env.GITHUB_REPO||"",path:"index.html"}),d=Buffer.from(n.content,"base64").toString(),p=`

             <!-- ========== IMAGE ${s.title?.[0]} ========== -->

          <div class="folio-item work-item dsn-col-md-2 dsn-col-lg-3 ${s.category?.[0]||"illustration"} column" data-aos="fade-up">
            <div class="has-popup box-img before-z-index z-index-0 p-relative over-hidden folio-item__thumb" data-overlay="0">
              <a class="folio-item__thumb-link box-img" target="_blank" href="assets/Artworks NEW/${i}" data-size="905x1280">
                <img class="cover-bg-img" src="assets/Artworks NEW/${i}" alt="${s.title?.[0]}">
              </a>
            </div>
            <div class="folio-item__info">
              <div class="folio-item__cat">${s.category?.[0]||"illustration"}/${s.subcategory?.[0]||""} ${new Date().getFullYear()}</div>
              <h4 class="folio-item__title">${s.title?.[0]}</h4>
            </div>
            ${s.twitterLink?`
            <a target="_blank" href="${s.twitterLink?.[0]}" title="Twitter" class="folio-item__project-link">Twitter</a>
            <div class="folio-item__caption">
              <p>Twitter</p>
            </div>`:""}
          </div>

          <!-- ========== IMAGE END ========== -->

          `,c=d.replace(/(id="gallery-section"[^>]*>)([\s\S]*?)(<div[^>]*class="[^"]*folio-item[^"]*")/,(e,t,a,s)=>{let r=s.replace('class="','class="mt-80 ');return`${t}${p}${r}`});await a.repos.createOrUpdateFileContents({owner:process.env.GITHUB_OWNER||"",repo:process.env.GITHUB_REPO||"",path:"index.html",message:"Add new artwork to gallery",content:Buffer.from(c).toString("base64"),sha:n.sha}),console.log("✅ Changes pushed to GitHub. Build status:",{imageUploaded:!0,htmlUpdated:!0,deploySkipped:!0}),t.status(200).json({message:"Upload successful",github:!0})}catch(e){console.error("❌ Upload failed:",e),t.status(500).json({message:"Upload failed",error:e.message})}})}catch(e){console.error("Error during upload:",e),t.status(500).json({message:"Upload failed",error:e})}}s()}catch(e){s(e)}})}};var t=require("../../webpack-api-runtime.js");t.C(e);var __webpack_exec__=e=>t(t.s=e),a=t.X(0,[222],()=>__webpack_exec__(3745));module.exports=a})();