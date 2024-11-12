DB :
    employee
        - id
        - name
        - surname
        - email
        - phone
        - position (BA,DEV)
    
    task
        - id
        - detail
        - dead_line
        - state
        - owner
        - created_at
    
    task_to_do
        - task_id (task.id)
        - owner (task.owner)
        - start_date (now)
        - dead_line (task.dead_line)

    task_success
        - task_id (task.id)
        - owner (task.owner)
        - date_line (task.dead_line)
        - status (success , delayed)

Page employee
    table  : name , surname , email , phone , position (filter BA,DEV)
    button : create employee
        Form
            create : employee
            input  : name , surname , email , phone , position
            to db  : employee
            submit : insert db employee

Page assign
    table  : * task (filter owner,state)
    button : new assign task
        Form
            input : detail , dead_line , state(dropdown assign,start), owner(dropdown employee.name where position = dev) , created_at(now)
            to db : task
            submit : insert db task

Page delayed task
    table  : task_to_do * where dead_line > now