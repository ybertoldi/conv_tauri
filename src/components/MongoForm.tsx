export function MongoForm() {
  return (
    <form class="border-2 rounded-md p-5" >
      <h2 class="text-base/9 font-semibold ">Configurações MongoDb</h2>

      <div class="mt-5 grid grid-cols-6">
        <div class="sm:col-span-6">
          <label for="mongo_url" class="block text-sm/6 font-medium text-black">url</label>
          <div class="flex items-center gap-x-6 ">
            <input type="text" class=" outline-1 rounded-md block bg-gray-200 outline-black/10 grow py-2 pr-3 pl-1 text-base text-black focus:outline-none sm:text-sm/6" />
            <button class="rounded-md bg-indigo-500 px-10 py-2 text-sm font-semibold text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500">Conectar</button>
          </div>
        </div>
      </div>

      <div class="mt-5 border-black/10">
        <div class="grid grid-cols-1 gap-x-6 sm:grid-cols-6">
          <div class="sm:col-span-3">
            <label for="first-name" class="block text-sm/6 font-medium text-black">Host</label>
            <div class="mt-2">
              <input id="first-name" type="text" name="first-name" autocomplete="given-name" class="block w-full rounded-md bg-black/5 px-3 py-1.5 text-base text-black outline-1 -outline-offset-1 outline-black/10 placeholder:text-blue-500 focus:outline-2 focus:-outline-offset-2  sm:text-sm/6" />
            </div>
          </div>

          <div class="sm:col-span-3">
            <label for="last-name" class="block text-sm/6 font-medium text-black">port</label>
            <div class="mt-2">
              <input id="last-name" type="text" name="last-name" autocomplete="family-name" class="block w-full rounded-md bg-black/5 px-3 py-1.5 text-base text-black outline-1 -outline-offset-1 outline-black/10 placeholder:text-blue-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6" />
            </div>
          </div>

          <div class="sm:col-span-3">
            <label for="first-name" class="block text-sm/6 font-medium text-black">user</label>
            <div class="mt-2">
              <input id="first-name" type="text" name="first-name" autocomplete="given-name" class="block w-full rounded-md bg-black/5 px-3 py-1.5 text-base text-black outline-1 -outline-offset-1 outline-black/10 placeholder:text-blue-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6" />
            </div>
          </div>

          <div class="sm:col-span-3">
            <label for="last-name" class="block text-sm/6 font-medium text-black">password</label>
            <div class="mt-2">
              <input id="last-name" type="text" name="last-name" autocomplete="family-name" class="block w-full rounded-md bg-black/5 px-3 py-1.5 text-base text-black outline-1 -outline-offset-1 outline-black/10 placeholder:text-blue-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6" />
            </div>
          </div>

          <div class="sm:col-span-3">
            <label for="postal-code" class="block text-sm/6 font-medium text-black">Database</label>
            <div class="flex mt-2 gap-x-6 ">
              <input id="postal-code" type="text" name="postal-code" autocomplete="postal-code" class="block w-full rounded-md bg-black/5 px-3 py-1.5 text-base text-black outline-1 -outline-offset-1 outline-black/10 placeholder:text-blue-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6" />
              <button class="rounded-md bg-indigo-500  px-3 py-2 text-sm font-semibold text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500">+</button>
            </div>
          </div>

        </div>
      </div>
    </form>
  )
}

export default MongoForm;
