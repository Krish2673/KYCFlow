await emailQueue.add(

    "daily-summary",

    {},

    {

        repeat: {

            pattern:
                "0 8 * * *"

        }

    }

);