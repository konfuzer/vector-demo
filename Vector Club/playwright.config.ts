import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'./tests',testMatch:'**/*.e2e.ts',fullyParallel:false,workers:1,timeout:30000,retries:0,reporter:[['list'],['html',{open:'never'}]],use:{baseURL:'http://127.0.0.1:5195',viewport:{width:1440,height:900},trace:'retain-on-failure',screenshot:'only-on-failure'},webServer:{command:'npm run dev',url:'http://127.0.0.1:5195',reuseExistingServer:true,timeout:30000}});

