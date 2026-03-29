<script>
    let {data, form} = $props()
    import { enhance } from "$app/forms";
	  import { goto } from "$app/navigation";

    let resetingPassword = $state(false)

    
</script>

<form method="post" action="?/sendLinkByEmail" 
    use:enhance ={(({formElement})=>{
    resetingPassword = true
    return async ({result, update}) => {
        await update(); 
        resetingPassword = false
        if (result?.data.success) {
        formElement.reset()
        console.log(result.data.message)
        }
    }
    })}
>
<div id="field">
  <label>
    Adresse Email  :
    <input type="email" name="email" required />
  </label>

</div>

<button disabled={resetingPassword}> Envoyer le mail de récupération </button>
</form> 

<button onclick={()=>goto("/")}>Menu</button>


{#if form?.error}
  <p style="color:red;">{form.error}</p>
{/if}

{#if form?.success}
<p>{form.message}</p>
{/if}
