import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { z } from "zod";
import {usernameValidation}from "@/schemas/signUpSchema"


const UsernameQuerySchema = z.object({
    username: usernameValidation
})

export async function GET(request:Request) {
    //TODO:  use this in all route
    if (request.method != 'GET') {
        return Response.json(
            {
                success: false,
                message: "Method not allowed",
            },
            {status: 405}
        )
    }

    await dbConnect()

    try {
        const {searchParams} = new URL(request.url)
        const queryParam = {
            username: searchParams.get('username')
        }
        //validate with zod
        const result = UsernameQuerySchema.safeParse(queryParam)
        console.log(result) // Remobve it
        if (!result.success) {
            const usernameErrors = result.error.format().username?._errors || []
            return Response.json(
                {
                    success: false,
                    message: usernameErrors?.length > 0 ?usernameErrors.join(', '): 'Invalid query parameters',
                },
                {status: 400}
            )
        }


        const {username} = result.data

        const existingVerifiesUser = await UserModel.findOne({username, isVerified: true})

        if (existingVerifiesUser) {
            return Response.json(
                {
                    success: false,
                    message: 'Username is already taken'
                },
                {status: 400}
            )
        }

        return Response.json(
            {
                success: true,
                message: 'Username is unique'
            },
            {status: 400}
        )

    } catch (error) {
        console.error("Error checking username", error);
        return Response.json(
            {
                success: false,
                message: "Error checking username"
            },
            {status: 500}
        )
    }


}