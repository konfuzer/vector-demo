import { defineConfig } from '@playwright/test';
const baseURL=process.env.PLAYWRIGHT_BASE_URL||'http://127.0.0.1:5193';
export default defineConfig({testDir:'tests',testMatch:'browser.spec.ts',timeout:30000,expect:{timeout:8000},fullyParallel:false,workers:1,reporter:[['list'],['html',{open:'never'}]],use:{baseURL,channel:'msedge',headless:true,viewport:{width:1440,height:900},trace:'retain-on-failure',screenshot:'only-on-failure'},webServer:process.env.PLAYWRIGHT_BASE_URL?undefined:{command:'npm run dev',url:baseURL,reuseExistingServer:true,timeout:30000}});
