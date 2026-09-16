import { useEffect, useState } from 'react';
import api from '../../api/axios';
import Loader from '../../components/Loader';
import toast from 'react-hot-toast';

export default function Notifications(){
  const [items,setItems]=useState([]); const [loading,setLoading]=useState(true);
  const load=async()=>{try{setLoading(true);const {data}=await api.get('/notifications');setItems(data.notifications||[]);}catch(e){toast.error(e.response?.data?.message||'Unable to load notifications');}finally{setLoading(false)}};
  useEffect(()=>{load()},[]);
  const read=async(id)=>{try{await api.patch(`/notifications/${id}/read`);load()}catch(e){toast.error('Unable to mark notification as read')}};
  if(loading)return <Loader text="Loading notifications..."/>;
  return <section><h1 className="text-3xl font-bold mb-6">Notifications</h1><div className="space-y-3">{!items.length?<p className="text-slate-500">No notifications yet.</p>:items.map(n=><button onClick={()=>read(n._id)} key={n._id} className={`w-full text-left bg-white border rounded-xl p-4 ${!n.readAt?'border-blue-300':''}`}><p className="font-semibold">{n.title}</p><p className="text-slate-600 mt-1">{n.message}</p><p className="text-xs text-slate-400 mt-2">{new Date(n.createdAt).toLocaleString()}</p></button>)}</div></section>
}
