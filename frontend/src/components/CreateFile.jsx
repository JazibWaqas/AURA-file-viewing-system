export default function CreateFile() {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Create a File</h1>
        <form className="bg-white p-6 rounded shadow w-3/4">
          <table className="w-full border mb-4">
            <thead>
              <tr>
                <th>Account</th>
                <th>Q1</th>
                <th>Q2</th>
                <th>Q3</th>
                <th>Q4</th>
                <th>Total Annual</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><input className="border p-1" placeholder="Revenue" /></td>
                <td><input className="border p-1" /></td>
                <td><input className="border p-1" /></td>
                <td><input className="border p-1" /></td>
                <td><input className="border p-1" /></td>
                <td><input className="border p-1" /></td>
              </tr>
              {/* Add more rows as needed */}
            </tbody>
          </table>
          <button className="px-4 py-2 bg-blue-600 text-white rounded" type="submit">Done</button>
        </form>
      </div>
    );
  }