export default function FileUploader() {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Upload File</h1>
        <form className="bg-white p-6 rounded shadow w-1/2">
          <label className="block mb-2 font-bold">Select File</label>
          <input type="file" className="mb-4" />
          <button className="px-4 py-2 bg-blue-600 text-white rounded" type="submit">Upload</button>
        </form>
      </div>
    );
  }