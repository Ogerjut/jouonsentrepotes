<script lang='ts'>
    import Settings from '@lucide/svelte/icons/settings'
	import { enhance } from "$app/forms";
	import ChatFontColors from './ChatFontColors.svelte';
	import type { ActionData, PageData } from '../../routes/chat/$types';
	import type { ChatMessages } from '$lib/types/chat';

    interface ChatProps {
        data: PageData;
        form: ActionData;
    }
	
    let {data, form} : ChatProps = $props()

    let messages = $derived(data.messages)
    let sending = $state(false)
    let showChatSetting = $state(false)
    let fontColor = $state("blue")

</script>

<div id="page-container">
    <div id="chat-container">
        <span id="title"><h1>CHAT</h1> <button id="button-setting" onclick={()=>showChatSetting = !showChatSetting}><Settings/></button>  </span> 
        <div id="msg-container">
            {#each [...messages].reverse() as msg}
                <div class="message">
                    <span class="author">{msg.author}</span>
                    <span class="time">({new Date(msg.date).toLocaleTimeString()})</span> :
                    <span class="content" style="--color:{msg.fontColor}">{msg.content}</span>
                </div>
            {/each}
        </div>    

        <form action="?/sendMessage" method="post"
        use:enhance={(({formElement})=>{
            sending = true
        return async ({result, update}) => {
            await update(); 
            sending = false
            if (result.type === "success" && result?.data?.success) {
                console.log(result.data)
                formElement.reset()
                messages = result.data.messages as ChatMessages
                
            
            }}})}
        >
            
            <div style="display : flex; width : 100%">
                <input id="input-msg" style="--color:{fontColor}" type="text" name="msg" placeholder="Ton message">
                <input type="hidden" name="color" value={fontColor}>
                <button disabled={sending} type="submit">Envoyer</button>
            </div>
        </form>
        

    </div>
    {#if showChatSetting}
        <div>
            <ChatFontColors bind:fontColor={fontColor}/>
        </div>
    {/if}
</div>

<style>
    #page-container{
        display: flex;
        justify-content: center;
        width: 100%;
    }

    #chat-container{
        border-radius: 15px;
        background-color: var(--color-bg-box);
        display: flex;
        flex-direction: column;
        width: 75%;
        min-width: 50%;
        height: 400px;
        align-items: center;
        margin: 2px;
        box-shadow: var(--box-shadow-1);
        flex-shrink: 0;
        

    }

    #msg-container {
        display: flex;
        flex : 1;
        flex-direction: column;
        overflow-y: auto;
        align-self : stretch;
        font-size: small;
        margin: 2px;
    }

    #title, #button-setting{
        background-color: var(--color-text-2);
        align-self: stretch;
        color : white;
        border-top-left-radius: 12px;
        border-top-right-radius: 12px;
        display: flex;
        justify-content: space-between;
        padding: 2px;
    }

    h1 {
       margin-left: 45%;
        
    }

    .message {
        word-wrap: break-word;
        word-break: break-word;
        white-space: pre-wrap;
        padding: 2px 4px;
    }

    form{
        margin: 1px;
        display : flex;
        align-self: stretch;
        margin: 2px;
    }

    input{
        border-bottom-left-radius: 14px;
        flex : 1
        
    }


    button{
        border-radius: 0;
        padding: 8px;
        box-shadow: 0px 0px 0px;
        border-bottom-right-radius: 14px;
    }

    .time {
        font-size: x-small;
    }

    .author{
        font-weight: bold;
    }

    .content, #input-msg{
        color : var(--color)
    }



    

</style>