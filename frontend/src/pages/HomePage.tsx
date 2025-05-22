
import Navbar from '../components/Navbar';

function HomePage() {
    const updates = [
        { founder: "alvin", company: "round3.xyz", content: "Hello world suckers" },
        {
          founder: "notalvin",
          company: "round4.xyz",
          content: "Hello world suckers",
        },
      ];

      const token = "asfaf";
  return (

    <>
      <div className="flex  flex-col p-2 gap-8">
        {/*now thats a fucking navbar*/}
        <Navbar></Navbar>

        <div className="flex flex-col">
          <p className="text-xl">Founder Mode</p>
          <form className="flex flex-col gap-2">
            <textarea
              className="border-1 border-solid rounded-lg w-64"
              placeholder="write your updates"
            ></textarea>
            <button
              type="submit"
              className="bg-blue-500 rounded-lg px-2 max-w-24"
            >
              Submit
            </button>
          </form>
        </div>
        
        <div className="flex flex-col">
          <p className="text-xl">Your updates</p>
          {updates.length > 0 &&
            updates.map((update) => (
              <div className="border-2 p-4">
                <h2>Company:{update.company}</h2>
                <p>Founder:{update.founder}</p>
                <input readOnly value={token}></input>
                <button
                  form="cancelsub"
                  className="bg-red-500  px-2 max-w-fit cursor-pointer "
                >
                  Cancel this Subscription!
                </button>
              </div>
            ))}
        </div>

      </div>
    </>
  )
}

export default HomePage