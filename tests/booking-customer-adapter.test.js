import test from "node:test";
import assert from "node:assert/strict";
import { bookingToCustomer, previewBookingMerge } from "../src/booking-customer-adapter.js";

const booking = {id:"AUR-261030-ABCDEF123456",name:"虚构顾客",gender:"女性",birthday:"21/11/1995",service:"人生蓝图解析、黄金流年蓝图解析",status:"待订金",created_at:"2026-10-30T00:00:00Z",related:[]};

test("maps a synthetic booking to a namespaced customer without exposing payment secrets",()=>{
 const result=bookingToCustomer(booking);
 assert.equal(result.id,"booking:"+booking.id);
 assert.deepEqual(result.consultationTypes,["人生蓝图解析","黄金流年蓝图解析"]);
 assert.equal(result.bookingStatus,"待订金");
 assert.equal(result.sourceBookingId,booking.id);
});

test("parses the actual booking Worker fullwidth-plus service delimiter",()=>{
 const result=bookingToCustomer({...booking,service:"人生蓝图解析＋黄金流年蓝图解析"});
 assert.deepEqual(result.consultationTypes,["人生蓝图解析","黄金流年蓝图解析"]);
 assert.equal(result.consultationType,"人生蓝图解析");
});

test("preview preserves local customers and deduplicates repeat bookings",()=>{
 const local=[{id:"local-1",name:"既有虚构顾客"}];
 const original=JSON.stringify(local);
 const preview=previewBookingMerge(local,[booking,booking]);
 assert.equal(preview.existingCount,1);
 assert.equal(preview.newCustomers.length,1);
 assert.equal(preview.duplicateCount,1);
 assert.equal(JSON.stringify(local),original);
});

test("preview detects existing booking link or namespaced ID without changing local data",()=>{
 for (const existing of [
  {id:"local-42",sourceBookingId:booking.id,name:"原有顾客"},
  {id:"booking:"+booking.id,name:"原有顾客"},
 ]) {
  const local=[existing];
  const original=JSON.stringify(local);
  const preview=previewBookingMerge(local,[booking]);
  assert.equal(preview.newCustomers.length,0);
  assert.equal(preview.duplicateCount,1);
  assert.equal(JSON.stringify(local),original);
 }
});

test("invalid IDs, unknown services and duplicate service items are rejected",()=>{
 assert.throws(()=>bookingToCustomer({...booking,id:"bad"}));
 assert.throws(()=>bookingToCustomer({...booking,service:"儿童蓝图解析"}));
 assert.throws(()=>bookingToCustomer({...booking,service:"人生蓝图解析＋人生蓝图解析"}));
});

test("rejects impossible dates without mutating existing local records",()=>{
 const local=[{id:"local-1",name:"既有虚构顾客"}];
 const before=JSON.stringify(local);
 for(const birthday of ["31/02/1995","29/02/2025","01/01/1899","01/01/2999"]){
  assert.throws(()=>previewBookingMerge(local,[{...booking,birthday}]),/Invalid birthday/);
  assert.equal(JSON.stringify(local),before);
 }
 assert.equal(bookingToCustomer({...booking,birthday:"29/02/2024"}).birthday,"29/02/2024");
});
