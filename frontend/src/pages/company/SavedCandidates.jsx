import { useEffect,useState } from 'react';
import api from '../../api/axios';
import Loader from '../../components/Loader';
import toast from 'react-hot-toast';
export default function SavedCandidates(){
 const [rows,setRows]=useState([]),[loading,setLoading]=useState(true);
 const load=async()=>{try{setLoading(true);const {data}=await api.get('/saved-candidates');setRows(data.candidates||[])}catch(e){toast.error(e.response?.data?.message||'Unable to load saved candidates')}finally{setLoading(false)}};
 useEffect(()=>{load()},[]);
 const remove=async(id)=>{try{await api.delete(`/saved-candidates/${id}`);toast.success('Candidate removed');load()}catch(e){toast.error(e.response?.data?.message||'Unable to remove candidate')}};
 if(loading)return <Loader text="Loading saved candidates..."/>;
 return <section><h1 className="text-3xl font-bold mb-6">Saved Candidates</h1>{!rows.length?<p className="text-slate-500">No candidates saved yet. Use Talent Search to save candidates.</p>:<div className="grid md:grid-cols-2 gap-4">{rows.map(r=><article key={r._id} className="bg-white border rounded-2xl p-5"><h2 className="font-semibold">{r.student?.name}</h2><p className="text-slate-500">{r.student?.email}</p><button onClick={()=>remove(r.student?._id)} className="mt-4 text-red-600">Remove</button></article>)}</div>}</section>
}
