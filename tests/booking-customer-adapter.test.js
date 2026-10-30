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

test("preview preserves local customers and deduplicates repeat bookings",()=>{
 const local=[{id:"local-1",name:"既有虚构顾客"}];
 const original=JSON.stringify(local);
 const preview=previewBookingMerge(local,[booking,booking]);
 assert.equal(preview.existingCount,1);
 assert.equal(preview.newCustomers.length,1);
 assert.equal(preview.duplicateCount,1);
 assert.equal(JSON.stringify(local),original);
});

test("invalid IDs and unknown services are rejected",()=>{
 assert.throws(()=>bookingToCustomer({...booking,id:"bad"}));
 assert.throws(()=>bookingToCustomer({...booking,service:"儿童蓝图解析"}));
});
