import {GraphQLFormattedError} from 'graphql'

type Error={
    message:string;
    statusCode:string;
}


const customeFetch=async(url:string,options:RequestInit)=>{
const accessToken=localStorage.getItem('access_token');

const headers=options.headers as Record<string,string>;

return await fetch(url,{
    ...options,
    headers:{
        ...headers,
        Authorization: headers?.Authorization|| `Bearer ${accessToken}`,
        "Content-type":"application/json",
        "Apollo-Require-PreFlight":"true",
    }
})
}

const getGraphQLErrors=(body:Record<"errors",GraphQLFormattedError[] | undefined>):Error | null=>{
    if(!body){
        return{
            message:"Unknown error",
            statusCode:"IMTERNAL_SERVER_ERROR"
        }
    }
    if("error" in body){
        const errors=body?.errors;
        const messages=errors?.map( e =>e.message ).join("");
        const code=errors?.[0]?.extensions.code;
        return{
            message:messages||JSON.stringify(errors),
            statusCode:code||500
        }

    }

}

export const fetchWrapper= async(url:string,options:RequestInit)=>{
    const response=await customeFetch(url,options);
    const responseClone=response.clone();
    const body=await responseClone.json();
    const error=getGraphQLErrors(body);
    if(error){
        throw error;
    }
}