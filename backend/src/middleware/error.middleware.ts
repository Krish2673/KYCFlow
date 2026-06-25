import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError";
import { ZodError } from "zod";

export const errorHandler = (

    err: Error,

    req: Request,

    res: Response,

    next: NextFunction

) => {

    if (err instanceof AppError) {

        return res.status(err.statusCode).json({

            success: false,

            message: err.message,

        });

    }

    if (err instanceof ZodError) {

    return res.status(400).json({

        success: false,

        message: "Validation Failed",

        errors: err.issues

    });

}

    console.error(err);

    return res.status(500).json({

        success: false,

        message: "Internal Server Error",

    });

};