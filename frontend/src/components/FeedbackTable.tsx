import type { Feedback } from "../types/Feedback";

export default function FeedbackTable({data}:{data:Feedback[]}){

return(

<table className="w-full bg-white shadow rounded">

<thead className="bg-gray-200">

<tr>
<th>Name</th>
<th>Category</th>
<th>Priority</th>
<th>Sentiment</th>
</tr>

</thead>

<tbody>

{data.map(f=>(
<tr key={f._id} className="border-t">

<td>{f.name}</td>
<td>{f.category}</td>
<td>{f.priority}</td>
<td>{f.sentiment}</td>

</tr>
))}

</tbody>

</table>

);

}