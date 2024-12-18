import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { json } from "stream/consumers";

export async function POST(request: Request) {
    await dbConnect()

    try {
        const { username, code } = await request.json()

        const decodedUsername = decodeURIComponent(username)
        const user = await UserModel.findOne({ username: decodedUsername })

        if (!user) {
            return Response.json(
                {
                    success: false,
                    message: "User not found"
                },
                { status: 500 }
            )
        }

        const isCodeValid = user.verifyCode === code
        const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date()

        if (isCodeValid && isCodeNotExpired) {
            user.isVerified = true
            await user.save()

            return Response.json(
                {
                    success: true,
                    message: "Account verified successfully"
                },
                { status: 200 }
            )
        }else if (!isCodeNotExpired) {
            return Response.json(
                {
                    success: false,
                    message: "Verification code has expired, please signup agein to get new verification code"
                },
                { status: 400 }
            )
        }else{
            return Response.json(
                {
                    success: false,
                    message: "Incorrect  verification code"
                },
                { status: 200 }
            )
        }

    } catch (error) {
        console.error("Error verifing user", error);
        return Response.json(
            {
                success: false,
                message: "Error verifing user"
            },
            { status: 500 }
        )
    }
}
