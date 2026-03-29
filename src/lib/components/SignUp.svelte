<script lang='ts'>
  import { enhance } from "$app/forms";
  import { goto } from "$app/navigation";
	import type { ActionData } from "../../routes/$types";

  interface SignUpProp {
    form : ActionData
  }

  let {form} : SignUpProp = $props()

  let registering = $state(false)

</script>
  


<div id="sign-up-container">
  
  <form method="post" action="?/signup" 
    use:enhance={(({formElement})=>{
      registering = true
    return async ({result, update}) => {
        await update(); 
        registering = false
        if (result.type === "success" && result?.data?.success) {
          formElement.reset()
          goto('/')

        }

      }
    })}>

    <h1><u>Inscription </u></h1>

    <div id="field">
      <label>
        Pseudo :
        <input type="text" name="username" required />
      </label>
  
      <label>
        Email :
        <input type="email" name="email" required />
      </label>
      
      <label>
       Mot de passe :
        <input type="password" name="password" required />
      </label>

      <label>
        Répéter mot de passe :
         <input type="password" name="password2" required />
       </label>

    </div>
    
    <button disabled={registering}> S'inscrire ! </button>

    {#if form?.error && !registering}
      <p style="color:red;">{form.error}</p>
    {/if}

    {#if registering }
    <span class="saving"> saving your datas...</span>        
    {/if}

    {#if form?.success}
      <span> Registered, you can now log in  </span>
    {/if}

  </form>



</div>





<style>

#sign-up-container {
    box-shadow: var(--box-shadow-1);
    border-radius: 15px;
    margin-top: 10px;
    
  }
  
  form {
    padding: 15px;
    background-color: var(--color-bg-box);
    border-radius: 15px;
    align-items: center;
    display: flex;
    flex-direction: column;
    
  }

  #field {
    align-items: end;
    padding: 10px;
    display: flex;
    flex-direction: column;
  }

  input {
    margin: 2px;
    border-radius: 10px;
  }


  h1{
    font-size:xx-large;
  }

</style>


  