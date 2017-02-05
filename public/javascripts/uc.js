/*  */
var compute_total_price_per_unit = function( element, item )
{
    var unit_price = parseFloat( item.price().slice(0,-1) )
    var unit_deposit = parseFloat( item.deposit().slice(0,-1) )
    var order_quantity = parseFloat( item.order_quantity() )
    var order_return = parseFloat( item.order_return() )

    var price_total = 0

    price_total = ( ( unit_price * order_quantity ) + ( unit_deposit * order_quantity ) ) - ( unit_deposit * order_return )
    price_total = price_total.toFixed(2)

    item.price_total( price_total + '€' )
}

//
var compute_total_price_per_order = function()
{
    var total_price = 0
    var total_price_paid = 0

    $jQ( 'div.js-item-price' ).each( function()
    {
        // add to total_price
        var item_price = parseFloat( $jQ(this).text().slice(0,-1) )
        total_price += item_price

        // if it is paid add to total_price_paid to see the difference
        var button = $jQ(this).closest( 'tr.vem-participant' ).find( '.js-participant-paid' )

        if( button.hasClass( 'w3-pale-green' ) )
            total_price_paid += item_price
    })

    $jQ( 'td.js-order-total' ).text( total_price.toFixed(2) + '€' )
    $jQ( 'td.js-order-total-sofar' ).text( total_price_paid.toFixed(2) + '€' )
}
